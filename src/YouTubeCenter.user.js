/**
  The MIT License (MIT)

  Copyright © 2015 Jeppe Rune Mortensen

  Permission is hereby granted, free of charge, to any person obtaining a copy of
  this software and associated documentation files (the "Software"), to deal in
  the Software without restriction, including without limitation the rights to
  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  the Software, and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
// ==UserScript==
// @id              YouTubeCenter
// @name            @name@
// @namespace       http://www.facebook.com/YouTubeCenter
// @version         @version@
// @author          Jeppe Rune Mortensen <jepperm@gmail.com>
// @description     @name@ contains all kind of different useful functions which makes your visit on YouTube much more entertaining.
// @icon            https://raw.github.com/YePpHa/YouTubeCenter/master/assets/icon48.png
// @icon64          https://raw.github.com/YePpHa/YouTubeCenter/master/assets/icon64.png
// @domain          yeppha.github.io
// @domain          youtube.com
// @domain          www.youtube.com
// @domain          gdata.youtube.com
// @domain          apis.google.com
// @domain          plus.googleapis.com
// @domain          googleapis.com
// @domain          raw.github.com
// @domain          raw2.github.com
// @domain          raw.githubusercontent.com
// @domain          s.ytimg.com
// @match           http://www.youtube.com/*
// @match           https://www.youtube.com/*
// @match           http://youtube.com/*
// @match           https://youtube.com/*
// @match           https://yeppha.github.io/downloads/YouTubeCenter.meta.js
// @match           http://s.ytimg.com/yts/jsbin/*
// @match           https://s.ytimg.com/yts/jsbin/*
// @match           https://raw.github.com/YePpHa/YouTubeCenter/master/*
// @match           https://raw.githubusercontent.com/YePpHa/YouTubeCenter/master/*
// @match           http://raw.github.com/YePpHa/YouTubeCenter/master/*
// @match           http://raw.githubusercontent.com/YePpHa/YouTubeCenter/master/*
// @match           http://apis.google.com/*/widget/render/comments?*
// @match           https://apis.google.com/*/widget/render/comments?*
// @match           http://plus.googleapis.com/*/widget/render/comments?*
// @match           https://plus.googleapis.com/*/widget/render/comments?*
// @include         http://www.youtube.com/*
// @include         https://www.youtube.com/*
// @include         http://youtube.com/*
// @include         https://youtube.com/*
// @include         http://apis.google.com/*/widget/render/comments?*
// @include         https://apis.google.com/*/widget/render/comments?*
// @include         http://plus.googleapis.com/*/widget/render/comments?*
// @include         https://plus.googleapis.com/*/widget/render/comments?*
// @exclude         http://apiblog.youtube.com/*
// @exclude         https://apiblog.youtube.com/*
// @exclude         http://*.youtube.com/subscribe_embed?*
// @exclude         https://*.youtube.com/subscribe_embed?*
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @grant           GM_log
// @grant           GM_registerMenuCommand
// @grant           unsafeWindow
// @updateURL       @updateURL@
// @downloadURL     @downloadURL@
// @updateVersion   @ant-revision@
// @run-at          document-start
// @priority        9001
// @homepageURL     https://github.com/YePpHa/YouTubeCenter/wiki
// @contributionURL https://github.com/YePpHa/YouTubeCenter/wiki/Donate
// @supportURL      https://github.com/YePpHa/YouTubeCenter/issues
// @license         MIT
// ==/UserScript==

(function(){
  "use strict";
  function inject(func, bypass) {
    if (hasInjected && !bypass) return;
    hasInjected = true;
    
    injectScript(func);
  }
  function injectScript(func, filename, noArgs) {
	  filename = filename || "YouTubeCenter.js";
    var script = document.createElement("script");
    var parent = document.body || document.head || document.documentElement;
    if (!parent) {
      setTimeout(bind(null, injectScript, func, true), 0);
      return;
    }
    script.setAttribute("type", "text/javascript");
    if (typeof func === "string") {
      func = "function(){" + func + "}";
    }
	var fn = "(" + func + ")";
	if (noArgs) {
		fn += "()";
	} else {
		fn += "(true, @identifier@, @devbuild@, @devnumber@)";
	}
    script.appendChild(document.createTextNode(fn + ";\n//# sourceURL=" + filename));
    parent.appendChild(script);
    parent.removeChild(script);
  }
  
  function bind(scope, func) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function(){
      return func.apply(scope, args.concat(Array.prototype.slice.call(arguments)))
    };
  }
  
  function getNavigator() {
    try {
      if (window && typeof window.navigator === "object") {
        return window.navigator;
      } else if (typeof navigator === "object") {
        return navigator;
      }
    } catch (e) {
      return { /* empty */ };
    }
  }
  
  function isCookieEnabled() {
    try {
      var cookieEnabled = getNavigator().cookieEnabled;
      if (cookieEnabled === false) return false;
      
      setCookie("ytc_cookie_test", "testing", ".youtube.com", "/", 3600*60*24*30);
      var isEnabled = getCookie("ytc_cookie_test") === "testing";
      // Removing the test cookie
      setCookie("ytc_cookie_test", null, ".youtube.com", "/", 0);
      
      return isEnabled;
    } catch (e) {
      return false;
    }
  }
  
  function setCookie(name, value, domain, path, expires) {
    domain = domain ? ";domain=" + encodeURIComponent(domain) : "";
    path = path ? ";path=" + encodeURIComponent(path) : "";
    expires = 0 > expires ? "" : 0 == expires ? ";expires=" + (new Date(1970, 1, 1)).toUTCString() : ";expires=" + (new Date(now() + 1E3 * expires)).toUTCString();
    
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + domain + path + expires;
  }
  
  function getCookie(key) {
    return getCookies()[key];
  }
  
  function getCookies() {
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
  }
  
  function isEmbeddedVideo() {
    return !!loc.href.match(/^http(s)?:\/\/(www\.)?youtube\.com\/embed\//) || !!loc.href.match(/^http(s)?:\/\/(www\.)?youtube\.com\/watch_popup\?\//);
  }
  
  var main_function = function(injected, identifier, devbuild, devnumber, _unsafeWindow, preloadedSettings, undefined){
    "use strict";
    /* UTILS */
    function $UpdateChecker() {
      if (!ytcenter.settings.enableUpdateChecker) return;
      var curr = (new Date().getTime()),
          c = curr - 1000*60*60*parseInt(ytcenter.settings.updateCheckerInterval);
      con.log("Checking for updates in " + ((ytcenter.settings.updateCheckerLastUpdate - c)/1000/60/60) + " hours...");
      if (c >= ytcenter.settings.updateCheckerLastUpdate) {
        con.log("Checking for updates now...");
        ytcenter.settings.updateCheckerLastUpdate = curr;
        ytcenter.saveSettings();
        ytcenter.checkForUpdates();
      }
    }

    /*> buttons.js */
    
    function $Clone(obj) {
      var copy;
      if (null == obj || typeof obj != "object") {
        return obj;
      }
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }
      if (obj instanceof Array) {
        copy = [];
        for (var i = 0; i < obj.length; i++) {
          copy[i] = $Clone(obj[i]);
        }
        return copy;
      }
      if (obj instanceof Object) {
        copy = {};
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            copy[key] = $Clone(obj[key]);
          }
        }
        return copy;
      }
      return null;
    }
    
    function $ArrayIndexOf(arr, obj) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === obj) return i;
      }
      return -1;
    }
    
    function $AbsoluteOffset(elm) {
      var pos = [elm.offsetLeft || 0, elm.offsetTop || 0];
      if (elm.offsetParent) {
        var ao = $AbsoluteOffset(elm.offsetParent);
        pos[0] += ao[0];
        pos[1] += ao[1];
      }
      
      return pos;
    }
    
    function addPropertyWrapper(parent, property, wrapperFunc, callback) {
      function waitObject(parent, token) {
        var value;
        var loaded = false;
        // TODO research if it's possible to add listeners to an object instead of using setter and getter.
        defineLockedProperty(parent, token, function(aValue){
          value = aValue; // Always set the value as it's supposed to act like a normal property.
          if (!loaded) {
            loaded = true;
            iterate(); // Let's start the iteration again.
          }
        }, function(){
          return value;
        });
      }
      
      function iterate() {
        var token;
        // Make sure that at least one item is in the tokens array.
        while (tokens.length > 1 && (token = tokens.shift())) {
          // If the next token doesn't exists as a property then attach a `getter and setter` and wait for it to be written to.
          if (!parent[token]) {
            con.log("[Property Wrapper] Property doesn't exists in parent, attaching trigger using `getter and setter`.");
            waitObject(parent, token);
            tokens = [token].concat(tokens); // We attach the token at the start of the array because we removed it in while.
            return; // I will return one day...
          }
          parent = parent[token];
        }
        // We got to the end and we will then add the wrapper.
        addWrapper();
      }
      
      function addWrapper() {
        var func = parent[tokens[0]];
        con.log("[Property Wrapper] Wrapping `" + tokens[0] + "` function in a wrapper.");
        defineLockedProperty(parent, tokens[tokens.length - 1], function(value){
          func = value;
        }, function(){
          return function(){
            if (typeof func === "function") {
              var args = Array.prototype.slice.call(arguments, 0);
              var value = func.apply(this, args);
              wrapperFunc.apply(this, [value].concat(args));
            } else {
              con.warn("[Property Wrapper] Wrapped function is not a function!", func);
            }
            
            return value;
          };
        });
        
        callback();
      }
      
      con.log("[Property Wrapper] Wrapping the function " + tokens + " into a function wrapper.");
      
      // Creating the tokens from property
      var tokens = property.split(".");
      
      // Let's start our iteration
      iterate();
    }
    /* END UTILS */
    
    /* Classes (what) */
    function defineLockedProperty(obj, key, setter, getter) {
      if (typeof obj !== "object") obj = {};

      if (ytcenter.utils.ie || (typeof Object.defineProperty === "function" && !obj.__defineGetter__)) {
        Object.defineProperty(obj, key, {
          get: getter,
          set: setter
        });
        return obj;
      } else {
        obj.__defineGetter__(key, getter);
        obj.__defineSetter__(key, setter);
        return obj;
      }
    }
    
    function freeze(parent, freezeObject, predefinedObject) {
      function wait(_parent, _freezeObject) {
        var args = _freezeObject.split(".");
        var _object = undefined;
        defineLockedProperty(_parent, args[0], function(val){
          args.splice(0, 1);
          freeze(val, args.join("."));
          _object = val;
        }, function(){
          return _object;
        });
      }
      
      var args = freezeObject.split(".");
      var at = parent;
      for (var i = 0, len = args.length - 1; i < len; i++) {
        if (typeof at[args[i]] === "object") {
          at = at[args[i]];
        } else {
          args.splice(0, i);
          wait(at, args.join("."));
          return;
        }
      }
      
      var defObject = predefinedObject;
      var frozen = typeof predefinedObject !== "undefined";
      if (typeof at[args[args.length - 1]] !== "undefined") {
        defObject = at[args[args.length - 1]];
        frozen = true;
      }
      defineLockedProperty(at, args[args.length - 1], function(val){
        if (!frozen) {
          frozen = true;
          defObject = val;
        }
      }, function(){
        return defObject;
      });
    }
    
    var console_debug = devbuild; // Disable this to stop @name@ from writing in the console log.
    var _console = [];
    
    var uw = null,
      loc = null,
      con = null,
      ytcenter = {},
      yt = {};
    uw = _unsafeWindow || (function(){
      var a;
      try {
        a = unsafeWindow === window ? false : unsafeWindow;
      } catch (e) {
      } finally {
        return a || (function(){
          try {
            var e = document.createElement('p');
            e.setAttribute('onclick', 'return window;');
            return e.onclick();
          } catch (e) {
            return window;
          }
        }());
      }
    })();
    if (uw && typeof uw.ytcenter !== "undefined") {
      return;
    }
    ytcenter.unsafe = {};
    uw.ytcenter = ytcenter.unsafe;
    
    ytcenter.ltr = true;

    /*> UAParser.js */

    /*> report_issue.js */
    
    ytcenter.playerInstance = (function(){
      function setter(func) {
        return func;
      }
      function setProperty(key, setter, getter) {
        if (ytplayer[key]) {
          con.log("[Player Instance] Overwriting existing value.");
        }
        defineLockedProperty(ytplayer, key, setter, getter);
      }
      
      var ytplayer = (uw.ytplayer = uw.ytplayer || {});
      
      var exports = {};
      exports.setProperty = setProperty;
      
      return exports;
    })();
    
    ytcenter.html5PlayWrapper = (function(){
      function init() {
        try {
          if (!originalPlayFunc) originalPlayFunc = HTMLVideoElement.prototype.play;
          HTMLVideoElement.prototype.play = play;
          
          // Checking if the play function was successfully written to the HTMLVideoElement prototype.
          if (HTMLVideoElement.prototype.play === play) {
            initialized = true;
          }
        } catch (e) {
          con.error(e);
        }
      }
      function setReady(ready, spf) {
        isReady = ready;
        if (spf) isSPF = true;
      }
      function setForcedPause(bool) {
        forcePause = bool;
      }
      function setForcedStop(bool) {
        forceStop = bool;
      }
      function isInitialized() {
        return initialized;
      }
      function play() {
        if ((ytcenter.player.isPreventAutoBuffering() && !isReady) || forceStop) {
          HTMLVideoElement.prototype.pause.apply(this, arguments);
          
          var api = ytcenter.player.getAPI();
          if (api && api.stopVideo) {
            api.stopVideo();
            ytcenter.player.fixThumbnailOverlay(-1);
          }
          if (isSPF) {
            isReady = true;
          }
        } else if ((ytcenter.player.isPreventAutoPlay() && !isReady) || forcePause) {
          var expPlayer = ytcenter.utils.hasClass(document.body, "exp-watch-controls-overlay");
          if (expPlayer) {
            originalPlayFunc.apply(this, arguments);
          } else {
            HTMLVideoElement.prototype.pause.apply(this, arguments);
          }
          
          var api = ytcenter.player.getAPI();
          if (api && api.pauseVideo && expPlayer) {
            setTimeout(function(){
              api.pauseVideo();
            }, 7);
          } else if (api && api.pauseVideo && !expPlayer) {
            api.pauseVideo();
          }
          if (isSPF) {
            isReady = true;
          }
        } else {
          // Call the original play function
          originalPlayFunc.apply(this, arguments);
        }
      }
      
      var originalPlayFunc = null;
      var isReady = false;
      var isSPF = false;
      var forcePause = false;
      var forceStop = false;
      
      var initialized = false;
      
      init();
      
      var exports = {};
      exports.setReady = setReady;
      exports.isInitialized = isInitialized;
      exports.setForcedPause = setForcedPause;
      exports.setForcedStop = setForcedStop;
      
      return exports;
    })();
    
    ytcenter.updateLogoLink_ = null;
    ytcenter.updateLogoLink = function(){
      var logoContainer = document.getElementById("logo-container"),
        url = ytcenter.settings.logoLink;
      if (logoContainer && logoContainer.tagName === "A") {
        if (ytcenter.updateLogoLink_ === null) {
          ytcenter.updateLogoLink_ = logoContainer.getAttribute("href");
        }
        if (ytcenter.updateLogoLink_ !== "/" && (url.indexOf("http://") === 0 || url.indexOf("https://") === 0)) {
          url = ytcenter.updateLogoLink_.substring(0, ytcenter.updateLogoLink_.indexOf("http")) + url;
        } else if (ytcenter.updateLogoLink_ !== "/") {
          if (url.indexOf("/") === 0) url = url.substring(1);
          url = ytcenter.updateLogoLink_ + url;
        }
        logoContainer.setAttribute("href", url);
      } else if (logoContainer) {
        var map = logoContainer.getElementsByTagName("map");
        if (map && map.length > 0 && map[0] && map[0].children && map[0].children.length > 0) {
          if (ytcenter.updateLogoLink_ === null) ytcenter.updateLogoLink_ = map[0].children[0].getAttribute("href");
            if (ytcenter.updateLogoLink_ !== "/" && (url.indexOf("http://") === 0 || url.indexOf("https://") === 0)) {
            url = ytcenter.updateLogoLink_.substring(0, ytcenter.updateLogoLink_.indexOf("http")) + url;
          } else if (ytcenter.updateLogoLink_ !== "/") {
            if (url.indexOf("/") === 0) url = url.substring(1);
            url = ytcenter.updateLogoLink_ + url;
          }
          map[0].children[0].setAttribute("href", url);
        }
      }
    };

    /*> spf.js */

    loc = (function(){
      try {
        if (typeof location !== "undefined") return location;
        if (typeof window !== "undefined" && typeof window.location !== "undefined") return window.location;
        if (typeof uw !== "undefined" && typeof uw.location !== "undefined") return uw.location;
      } catch (e) {}
    })();
    if (loc.href.indexOf("http://apiblog.youtube.com/") === 0 || loc.href.indexOf("https://apiblog.youtube.com/") === 0) return;
    ytcenter.protocol = loc.href.indexOf("https://") === 0 ? "https://" : "http://";
    if (typeof console !== "undefined" && typeof console.log !== "undefined") {
      con = {};
      for (var key in console) {
        if (typeof console[key] === "function") {
          con[key] = (function(key){
            return function(){
              try {
                var args = [];
                var _args = [];
                for (var i = 0; i < arguments.length; i++) {
                  args.push(arguments[i]);
                }
                if (key === "error" && args[0]) {
                  var tmp = {args: args.length === 1 ? args[0] : args, type: "error"};
                  if (args[0].message) {
                    tmp['message'] = args[0].message;
                  }
                  if (args[0].stack) {
                    tmp['stack'] = args[0].stack;
                  }
                  if (!(ytcenter && ytcenter.settings && !ytcenter.settings.debugConsole)) {
                    _console.push(tmp);
                  }
                  if (tmp['stack']) {
                    _args = [args[0].stack];
                  } else if (tmp['message']) {
                    _args = [args[0].message];
                  } else {
                    _args = args;
                  }
                } else {
                  _args = args;
                  if (!(ytcenter && ytcenter.settings && !ytcenter.settings.debugConsole)) {
                    _console.push({args: _args.length === 1 ? _args[0] : _args, type: key});
                  }
                }
                if (console_debug && console[key].apply) {
                  return console[key].apply(console, args)
                } else if (console_debug) {
                  return console[key](_args[0]);
                }
              } catch (e) {
                console.error(e);
              }
            };
          })(key);
        }
      }
    } else if (typeof uw.console !== "undefined" && typeof uw.console.log !== "undefined") {
      con = {};
      for (var key in uw.console) {
        if (typeof uw.console[key] === "function") {
          con[key] = (function(key){
            return function(){
              try {
                var args = [];
                var _args = [];
                for (var i = 0; i < arguments.length; i++) {
                  args.push(arguments[i]);
                }
                if (key === "error" && args[0]) {
                  var tmp = {args: args.length === 1 ? args[0] : args, type: "error"};
                  if (args[0].message) {
                    tmp['message'] = args[0].message;
                  }
                  if (args[0].stack) {
                    tmp['stack'] = args[0].stack;
                  }
                  if (!(ytcenter && ytcenter.settings && !ytcenter.settings.debugConsole)) {
                    _console.push(tmp);
                  }
                  if (tmp['stack']) {
                    _args = [args[0].stack];
                  } else if (tmp['message']) {
                    _args = [args[0].message];
                  } else {
                    _args = args;
                  }
                } else {
                  _args = args;
                  if (!(ytcenter && ytcenter.settings && !ytcenter.settings.debugConsole)) {
                    _console.push({args: _args.length === 1 ? _args[0] : _args, type: key});
                  }
                }
                if (console_debug && uw.console[key].apply) {
                  return uw.console[key].apply(uw.console, _args);
                } else if (console_debug) {
                  return uw.console[key](_args[0]);
                }
              } catch (e) {
                console.error(e);
              }
            };
          })(key);
        }
      }
    } else {
      con = {};
      for (var key in console) {
        if (typeof console[key] === "function") {
          con[key] = (function(key){
            return function(msg){
              try {
                var args = [];
                var _args = [];
                for (var i = 0; i < arguments.length; i++) {
                  args.push(arguments[i]);
                }
                if (key === "error" && args[0]) {
                  var tmp = {args: args.length === 1 ? args[0] : args, type: "error"};
                  if (args[0].message) {
                    tmp['message'] = args[0].message;
                  }
                  if (args[0].stack) {
                    tmp['stack'] = args[0].stack;
                  }
                  if (!(ytcenter && ytcenter.settings && !ytcenter.settings.debugConsole)) {
                    _console.push(tmp);
                  }
                  if (tmp['stack']) {
                    _args = [args[0].stack];
                  } else if (tmp['message']) {
                    _args = [args[0].message];
                  } else {
                    _args = args;
                  }
                } else {
                  _args = args;
                  if (!(ytcenter && ytcenter.settings && !ytcenter.settings.debugConsole)) {
                    _console.push({args: _args.length === 1 ? _args[0] : _args, type: key});
                  }
                }
                if (console_debug && GM_log.apply) {
                  return GM_log.apply(this, _args);
                } else {
                  return GM_log(_args[0]);
                }
              } catch (e) {
                console.error(e);
              }
            };
          })(key);
        }
      }
    }
    
    ytcenter.actionPanel = (function(){
      function getEventListener(options) {
        if (ytcenter.feather) return null;
        if (typeof uw.yt === "undefined" || typeof uw.yt.events === "undefined" || typeof uw.yt.events.listeners_ === "undefined") return null;
        var key, item = null;
        
        var listeners = uw.yt.events.listeners_;
        for (key in listeners) {
          item = listeners[key];
          if (item && item.length > 1 && options.element === item[0] && options.event === item[1]) {
            return item;
          }
        }
        item = null;
        
        return null;
      }
      function likeButtonListener(e) {
        function switchToPreferredTab() {
          setPanelEnabled("share", true);
          uw.setTimeout(function(){ switchTo(ytcenter.settings.likeSwitchToTab); }, 7);
        }
        if (ytcenter.feather) return;
        try {
          var isLiked = ytcenter.utils.hasClass(document.getElementById("watch-like-dislike-buttons"), "liked");
          
          setPanelEnabled("share", false);
          
          originalEventListener(e);
          
          if (ytcenter.settings.likeSwitchToTab !== "none" && !isLiked) {
            uw.setTimeout(switchToPreferredTab, 7);
          }
        } catch (e) {
          con.error(e);
        }
      }
      
      function setPanelEnabled(panel, enabled) {
        if (enabled) {
          var el = document.getElementById("action-panel-" + panel + "-disabled");
          if (el) {
            el.setAttribute("id", "action-panel-" + panel);
          }
        } else {
          var el = document.getElementById("action-panel-" + panel);
          if (el) {
            el.setAttribute("id", "action-panel-" + panel + "-disabled");
          }
        }
      }
      
      function switchTo(panel) {
        if (!panel || panel === "none") return;
        var btn = document.createElement("button");
        btn.className = "action-panel-trigger";
        btn.setAttribute("data-trigger-for", "action-panel-" + panel);
        
        var parent = document.getElementById("watch8-action-buttons");
        
        parent.appendChild(btn);
        btn.click();
        parent.removeChild(btn);
      }
      
      function getLikeButton() {
        return document.getElementById("watch-like");
      }
      function setup() {
        if (ytcenter.feather) return;
        if (maxSetupCalls < setupCalls) return;
        setupCalls++;
        
        try {
          if (likeButton && likeButtonListener && likeButtonEvent) {
            likeButton.removeEventListener("click", likeButtonListener, likeButtonEvent[4]);
          }
          
          if (ytcenter.getPage() !== "watch") return;
          con.log("[ActionPanel] Loading...");
          
          likeButton = getLikeButton();
          likeButtonEvent = getEventListener({ event: "click", element: likeButton });
          
          if (likeButton === null || likeButtonEvent === null || typeof likeButtonEvent[3] !== "function") {
            uw.setTimeout(function(){ setup(); }, 2500);
            return;
          }
          con.log("[ActionPanel] Setup has begun!");
          
          originalEventListener = likeButtonEvent[3];
          
          con.log("[ActionPanel] Adding/Removing listeners");
          likeButton.removeEventListener("click", originalEventListener, likeButtonEvent[4]);
          ytcenter.utils.addEventListener(likeButton, "click", likeButtonListener, likeButtonEvent[4]);
        } catch (e) {
          con.error(e);
        }
      }
      
      var enabled = true;
      var switchToElm = null;
      var observer = null;
      var originalEventListener = null;
      var likeButton = null;
      var likeButtonEvent = null;
      var delayedSwitchTabTimer = null;
      var maxSetupCalls = 10;
      var setupCalls = 0;
      
      return {
        switchTo: switchTo,
        setup: setup
      };
    })();
    ytcenter.mutation = (function(){
      var exports = {},
        M = null,
        setup = false,
        disconnects = [],
        disconnected = false;
      exports.fallbackObserve = function(target, options, callback){
        function MutationRecord(record) {
          this.addedNodes = record.addedNodes || null;
          this.attributeName = record.attributeName || null;
          this.attributeNamespace = record.attributeNamespace || null;
          this.nextSibling = record.nextSibling || null;
          this.oldValue = record.oldValue || null;
          this.previousSibling = record.previousSibling || null;
          this.removedNodes = record.removedNodes || null;
          this.target = record.target || null;
          this.type = record.type || null;
          this.event = record.event || null;
        }
        function c() {
          if (insertedNodes.length > 0 || removedNodes.length > 0) {
            mutationRecords.push(new MutationRecord({
              addedNodes: insertedNodes,
              removedNodes: removedNodes,
              type: "childList",
              target: target
            }));
          }
          
          if (attributes.length > 0) {
            for (i = 0; i < attributes.length; i++) {
              mutationRecords.push(new MutationRecord({
                attributeName: attributes[i].attributeName,
                attributeNamespace: attributes[i].attributeNamespace,
                oldValue: attributes[i].oldValue,
                type: "attributes",
                target: target
              }));
            }
          }
          
          if (attributes.length > 0) {
            for (i = 0; i < attributes.length; i++) {
              mutationRecords.push(new MutationRecord({
                attributeName: attributes[i].attributeName,
                attributeNamespace: attributes[i].attributeNamespace,
                oldValue: attributes[i].oldValue,
                type: "attributes",
                target: target
              }));
            }
          }
          if (characterDataModified) {
            mutationRecords.push(new MutationRecord({
              oldValue: characterDataModified.oldValue,
              type: "characterData",
              target: target
            }));
          }
          if (characterDataModified) {
            mutationRecords.push(new MutationRecord({
              oldValue: characterDataModified.oldValue,
              type: "characterData",
              target: target
            }));
          }
          if (subtreeModified) {
            mutationRecords.push(new MutationRecord({
              type: "subtree",
              target: target
            }));
          }
          
          callback(mutationRecords);
          
          // Cleaning up
          insertedNodes = [];
          removedNodes = [];
          mutationRecords = [];
          attributes = [];
          characterDataModified = null;
          subtreeModified = false;
          
          if (failsafe && !disconnected) {
            addListeners();
          }
        }
        function DOMNodeInserted(e) {
          insertedNodes.push(e.target);
          wrapperFunction();
        }
        function DOMNodeRemoved(e) {
          removedNodes.push(e.target);
          wrapperFunction();
        }
        function DOMAttrModified(e) {
          attributes.push({
            attributeName: e.attrName,
            attributeNamespace: e.attrName,
            oldValue: e.prevValue
          });
          wrapperFunction();
        }
        function DOMCharacterDataModified(e) {
          characterDataModified = {
            newValue: e.newValue,
            oldValue: e.prevValue
          };
          wrapperFunction();
        }
        function DOMSubtreeModified(e) {
          subtreeModified = true;
          wrapperFunction();
        }
        function addListeners() {
          if (options.childList) {
            ytcenter.utils.addEventListener(target, "DOMNodeInserted", DOMNodeInserted, false);
            ytcenter.utils.addEventListener(target, "DOMNodeRemoved", DOMNodeRemoved, false);
          }
          
          if (options.attributes) {
            ytcenter.utils.addEventListener(target, "DOMAttrModified", DOMAttrModified, false);
          }
          
          if (options.characterData) {
            ytcenter.utils.addEventListener(target, "DOMCharacterDataModified", DOMCharacterDataModified, false);
          }
          
          if (options.subtree) {
            ytcenter.utils.addEventListener(target, "DOMSubtreeModified", DOMSubtreeModified, false);
          }
        }
        function removeListeners() {
          disconnected = true;
          if (options.childList) {
            ytcenter.utils.removeEventListener(target, "DOMNodeInserted", DOMNodeInserted, false);
            ytcenter.utils.removeEventListener(target, "DOMNodeRemoved", DOMNodeRemoved, false);
          }
          
          if (options.attributes) {
            ytcenter.utils.removeEventListener(target, "DOMAttrModified", DOMAttrModified, false);
          }
          
          if (options.characterData) {
            ytcenter.utils.removeEventListener(target, "DOMCharacterDataModified", DOMCharacterDataModified, false);
          }
          
          if (options.subtree) {
            ytcenter.utils.removeEventListener(target, "DOMSubtreeModified", DOMSubtreeModified, false);
          }
        }
        function wrapperFunction(){
          if (failsafe) {
            removeListeners();
          }
          throttleFunc();
        }
        
        var buffer = null, i,
            insertedNodes = [],
            removedNodes = [],
            mutationRecords = [],
            attributes = [],
            characterDataModified = null,
            subtreeModified = false,
            throttleFunc = ytcenter.utils.throttle(c, 500),
            failsafe = true;
        if (typeof options.failsafe === "boolean") {
          failsafe = options.failsafe;
        }
        addListeners();
        
        return disconnects[disconnects.push({
          DOMNodeInserted: DOMNodeInserted,
          DOMNodeRemoved: DOMNodeRemoved,
          DOMAttrModified: DOMAttrModified,
          DOMCharacterDataModified: DOMCharacterDataModified,
          DOMSubtreeModified: DOMSubtreeModified,
          target: target,
          options: options,
          callback: callback,
          disconnect: removeListeners
        }) - 1];
      };
      exports.observe = function(target, options, callback){
        function mutationCallback(mutations) {
          // Disconnecting observer to prevent an infinite loop
          if (failsafe) {
            observer.disconnect();
          }
          
          callback(mutations);
          
          if (failsafe && !disconnected) {
            observer.observe(target, options);
          }
        }
        function finishedCalling() {
          calling = false;
        }
        var calling = false,
          failsafe = true;
        
        if (!target || !options || !callback) return;
        if (typeof options.failsafe === "boolean") {
          failsafe = options.failsafe;
        }
        if (!setup) exports.setup();
        
        //if (!M) return exports.fallbackObserve(target, options, callback); // fallback if MutationObserver isn't supported
        //if (!M) throw "MutationObserver not supported.";
        var observer = null;
        if (M) observer = new M(mutationCallback);
        var disconnected = false;
        if (observer) observer.observe(target, options);
        return disconnects[disconnects.push({
          target: target,
          options: options,
          callback: callback,
          disconnect: function(){
            disconnected = true;
            if (observer) observer.disconnect();
          }
        }) - 1];
      };
      exports.disconnect = function(target, callback){
        var i;
        for (i = 0; i < disconnects.length; i++) {
          if (target === disconnects[i].target && callback === disconnects[i].callback) {
            disconnects[i].disconnect();
          }
        }
      };
      exports.setup = function(){
        setup = true;
        M = ytcenter.getMutationObserver();
        ytcenter.unload(function(){
          var i;
          for (i = 0; i < disconnects.length; i++) {
            if (disconnects[i] && disconnects[i].disconnect) disconnects[i].disconnect();
          }
        });
      };
      
      return exports;
    })();

    /*> embed.js */
    
    ytcenter.io = {};
    
    ytcenter.unsafe.io = ytcenter.io;
    
    ytcenter.title = {};
    ytcenter.title.originalTitle = "";
    ytcenter.title.previousTitle = "";
    ytcenter.title.liveTitle = "";
    ytcenter.title.processOriginalTitle = function(a){
      if (ytcenter.player && ytcenter.player.config && ytcenter.player.config.args && ytcenter.player.config.args.title) {
        // Doesn't have a prefix or suffix.
        a = ytcenter.player.config.args.title;
      } else {
        // Can have prefix and suffix.
        a = a.replace(/^\u25b6 /, ""); // Removes the prefix.
        // The suffix is handled in the update process.
      }
      return a;
    };
    ytcenter.title.modified = function(){
      var a = document.getElementsByTagName("title")[0].textContent;
      if (a !== ytcenter.title.previousTitle) {
        if (ytcenter.title.originalTitle === "") {
          ytcenter.title.originalTitle = ytcenter.title.processOriginalTitle(a);
        }
        con.log("[Title Listener] \"" + ytcenter.title.previousTitle + "\" => \"" + a + "\"");
        ytcenter.title.previousTitle = a;
        ytcenter.title.update();
      }
    };
    ytcenter.title._init_count = 0;
    ytcenter.title.init = function(){
      var a = document.getElementsByTagName("title")[0];
      if ((a && a.textContent && a.textContent !== "") || (document && document.title && document.title !== "")) {
        ytcenter.title._init_count = 0;
        if (a && a.textContent && a.textContent !== "") {
          ytcenter.title.originalTitle = ytcenter.title.processOriginalTitle(a.textContent);
        } else {
          ytcenter.title.originalTitle = ytcenter.title.processOriginalTitle(document.title);
        }
        ytcenter.mutation.observe(document.head, { attributes: true, childList: true, characterData: true, subtree: true, failsafe: false }, ytcenter.title.modified);
        ytcenter.title.update();
      } else {
        if (ytcenter.title._init_count > 5) {
          ytcenter.title._init_count = 0;
          return;
        }
        con.log("[Title Listener] Waiting for title head...");
        ytcenter.title._init_count++;
        uw.setTimeout(ytcenter.title.init, 500);
      }
    };
    ytcenter.title.update = function(){
      if (ytcenter.title.originalTitle === "") return;
      //var a = document.getElementsByTagName("title")[0];
      if (ytcenter.settings.playerPlayingTitleIndicator && ytcenter.getPage() === "watch") {
        if (ytcenter.player.getAPI && ytcenter.player.getAPI() && ytcenter.player.getAPI().getPlayerState && ytcenter.player.getAPI().getPlayerState() === 1) {
          ytcenter.title.addPlayIcon();
        } else {
          ytcenter.title.removePlayIcon();
        }
      } else {
        ytcenter.title.removePlayIcon();
      }
      if (ytcenter.settings.removeYouTubeTitleSuffix) {
        ytcenter.title.removeSuffix();
      } else {
        ytcenter.title.addSuffix();
      }
      try {
        document.title = ytcenter.title.liveTitle;
      } catch (e) {
        con.error(e);
      }
    };
    ytcenter.title.hasSuffix = function(){
      return / - YouTube$/.test(ytcenter.title.liveTitle);
    };
    ytcenter.title.removeSuffix = function(){
      ytcenter.title.liveTitle = ytcenter.title.liveTitle.replace(/ - YouTube$/, "");
    };
    ytcenter.title.addSuffix = function(){
      if (ytcenter.title.hasSuffix()) return;
      ytcenter.title.liveTitle += " - YouTube";
    };
    ytcenter.title.hasPlayIcon = function(){
      return ytcenter.title.liveTitle.indexOf("\u25b6 ") === 0;
    };
    ytcenter.title.removePlayIcon = function(){
      ytcenter.title.liveTitle = ytcenter.title.originalTitle;
    };
    ytcenter.title.addPlayIcon = function(){
      ytcenter.title.liveTitle = "\u25b6 " + ytcenter.title.originalTitle;
    };
    
    ytcenter.inject = function(func){
      try {
        var script = document.createElement("script"),
            p = (document.body || document.head || document.documentElement);
        if (!p) {
          con.error("[Script Inject] document.body, document.head and document.documentElement doesn't exist!");
          return;
        }
        if (typeof func === "string") {
          func = "function(){" + func + "}";
        }
        script.setAttribute("type", "text/javascript");
        script.appendChild(document.createTextNode("(" + func + ")();\n//# sourceURL=YouTubeCenter.js"));
        p.appendChild(script);
        p.removeChild(script);
      } catch (e) {
        con.error(e);
      }
    };
    ytcenter.insertStyle = function(href, name){
      var link = document.createElement("link");
      var parent = (document.body || document.head || document.documentElement);
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", href);
      link.setAttribute("name", name);
      parent.appendChild(link);
    };
    ytcenter.insertScript = function(src, name){
      function onload() {
        onloadFunc && onloadFunc();
      }
      function setOnload(func) {
        onloadFunc = func;
      }
      var onloadFunc = null;
      
      var script = document.createElement("script");
      var parent = (document.body || document.head || document.documentElement);
      script.setAttribute("type", "text/javascript");
      script.setAttribute("src", src);
      script.setAttribute("name", name);
      script.onload = onload;
      script.onreadystatechange = function(){
        if (this.readyState === "complete") {
          onload();
        }
      };
      parent.appendChild(script);
      
      return {
        onload: setOnload
      };
    };
    ytcenter.unload = (function(){
      var unloads = [];
      
      window.addEventListener("unload", function(){
        var i;
        for (i = 0; i < unloads.length; i++) {
          if (typeof unloads[i] === "function") unloads[i]();
          else con.error("[Unload] Couldn't unload!", unloads[i]);
        }
      }, false);
      return function(unload){
        unloads.push(unload);
      };
    })();
    ytcenter.version = "@ant-version@";
    ytcenter.revision = @ant-revision@;
    ytcenter.icon = {};
    ytcenter.page = "none";
    ytcenter.feather = false;

    /*> icons.js */

    ytcenter.css = {
      general: "@styles-general@",
      resize: "@styles-resize@",
      topbar: "@styles-topbar@",
      flags: "@styles-flags@",
      html5player: "@styles-html5player@",
      gridview: "@styles-gridview@",
      images: "@styles-images@",
      dialog: "@styles-dialog@",
      scrollbar: "@styles-scrollbar@",
      list: "@styles-list@",
      confirmbox: "@styles-confirmbox@",
      panel: "@styles-panel@",
      resizePanel: "@styles-resize-panel@",
      modules: "@styles-modules@",
      settings: "@styles-settings@",
      centering: "@styles-centering@",
      embed: "@styles-embed@",
      player: "@styles-player@",
      darkside: "@styles-darkside@",
      feather: "@styles-feather@",
      elementFocus: "@styles-element-focus@"
      /*,
      yonez: "@styles-yonez-clean-yt@"*/
    };

    /*> top_scroll_player.js */

    ytcenter.videoHistory = (function(){
      var exports = {};
      exports.watchedVideos = [];
      exports.loadWatchedVideosFromYouTubePage = function(){
        var a = document.getElementsByClassName("watched"), i, b;
        for (i = 0; i < a.length; i++) {
          if (a[i].tagName === "A") {
            b = ytcenter.utils.getVideoIdFromLink(a[i].getAttribute("href"));
            if (b && !ytcenter.utils.inArray(exports.watchedVideos, b)) exports.watchedVideos.push(b);
          }
        }
      };
      exports.isVideoWatched = function(id){
        if (ytcenter.utils.inArray(ytcenter.settings.notwatchedVideos, id)) return false;
        if (ytcenter.utils.inArray(ytcenter.settings.watchedVideos, id) || ytcenter.utils.inArray(exports.watchedVideos, id)) return true;
        return false;
      };
      exports.removeVideo = function(id){
        var i = ytcenter.utils.inArrayIndex(ytcenter.settings.watchedVideos, id);
        if (i !== -1) {
          ytcenter.settings.watchedVideos.splice(i, 1);
        }
        if (!ytcenter.utils.inArray(ytcenter.settings.notwatchedVideos, id)) {
          if (ytcenter.settings.notwatchedVideosLimit < ytcenter.settings.notwatchedVideos.length) {
            ytcenter.settings.notwatchedVideos.splice(0, ytcenter.settings.notwatchedVideos.length - ytcenter.settings.notwatchedVideosLimit);
          }
          ytcenter.settings.notwatchedVideos.push(id);
        }
        ytcenter.saveSettings();
      };
      exports.addVideo = function(id){
        var i = ytcenter.utils.inArrayIndex(ytcenter.settings.notwatchedVideos, id);
        if (i !== -1) {
          ytcenter.settings.notwatchedVideos.splice(i, 1);
        }
        if (!ytcenter.utils.inArray(ytcenter.settings.watchedVideos, id)) {
          if (ytcenter.settings.watchedVideosLimit < ytcenter.settings.watchedVideos.length) {
            ytcenter.settings.watchedVideos.splice(0, ytcenter.settings.watchedVideos.length - ytcenter.settings.watchedVideosLimit);
          }
          ytcenter.settings.watchedVideos.push(id);
        }
        ytcenter.saveSettings();
      };
      
      return exports;
    })();
    ytcenter.subtitles = (function(){
      /**
        ytcenter.subtitles.getLanguageList(VIDEO_ID, function(doc){
          var l = ytcenter.subtitles.parseLanguageList(doc)[0], // Just selecting the first subtitle in the list.
              filename;
          if (typeof l.name === "string" && l.name !== "") filename = "[" + l.languageCode + "]" + l.name; // Generating filename
          else filename = l.languageCode; // Using language code as filename
          ytcenter.subtitles.getSubtitleLanguage(VIDEO_ID, l.name, l.languageCode, null, function(cc){ // Getting the selected subtitle
            cc = ytcenter.subtitles.parseSubtitle(cc); // Parsing the selected subtitle to JSON.
            ytcenter.subtitles.saveSubtitle(cc, "srt", filename); // Downloading the subtitle as srt with generated filename.
          });
        });
       **/
      var a = {};
      
      a.saveSubtitle = function(cc, type, filename){
        if (typeof type !== "string") type = "srt";
        var blob;
        if (type === "srt") {
          blob = new ytcenter.unsafe.io.Blob([ytcenter.subtitles.convertToSRT(cc)], { "type": "application/octet-stream" });
          ytcenter.unsafe.io.saveAs(blob, filename + ".srt");
        } else if (type === "cc") {
          
        } else {
          throw new Error("[Subtitles saveSubtitle] Invalid type (" + type + ")!");
        }
      };
      
      a.parseLanguageList = function(doc){
        if (!doc.children || doc.children.length <= 0 || doc.children[0].tagName !== "transcript_list") throw new Error("[Subtitles] Invalid language list!");
        var tl = doc.children[0].children,
            i, a = [];
        for (i = 0; i < tl.length; i++) {
          a.push({
            type: tl[i].tagName,
            languageCode: tl[i].getAttribute("lang_code") || "",
            displayedLanguageName: tl[i].getAttribute("lang_translated") || "",
            name: tl[i].getAttribute("name") || "",
            kind: tl[i].getAttribute("kind") || "",
            id: tl[i].getAttribute("id") || "",
            isDefault: tl[i].getAttribute("lang_default") || false,
            isTranslateable: tl[i].getAttribute("cantran") || false,
            formatList: (tl[i].getAttribute("formats") || "").split(",")
          });
        }
        return a;
      };
      
      a.parseSubtitle = function(doc){
        if (!doc.children || doc.children.length <= 0 || doc.children[0].tagName !== "transcript") throw new Error("[Subtitles] Invalid transcript (" + doc.children[0].tagName + ")!");
        var tl = doc.children[0].children,
            i, a = [], start, dur;
        for (i = 0; i < tl.length; i++) {
          if (tl[i].tagName === "text") {
            start = parseFloat(tl[i].getAttribute("start"));
            dur = parseFloat(tl[i].getAttribute("dur"));
            a.push({
              start: start,
              dur: dur,
              end: start + dur,
              text: ytcenter.utils.unescapeHTML(tl[i].textContent)
            });
          } else {
            con.warn("[Subtitles parseSubtitle] Invalid tag name (" + tl[i].tagName + ")!");
          }
        }
        return a;
      };
      a.convertToSRT = function(cc){
        var srt = "", i;
        
        for (i = 0; i < cc.length; i++) {
          srt += (i + 1) + "\r\n"
                + ytcenter.utils.srtTimeFormat(cc[i].start) + " --> " + ytcenter.utils.srtTimeFormat(cc[i].end) + "\r\n"
                + cc[i].text + "\r\n"
                + "\r\n";
        }
        
        return srt;
      };
      
      a.getLanguageList = function(videoId, callback, error){
        ytcenter.utils.xhr({
          url: ytcenter.protocol + "video.google.com/timedtext?type=list&v=" + encodeURIComponent(videoId),
          method: "GET",
          onload: function(response){
            var doc = ytcenter.utils.parseXML(response.responseText);
            if (callback) callback(doc);
          },
          onerror: function(){
            con.error("[Subtitles] Couldn't load subtitle list for video (" + videoId + ")");
            if (error) error();
          }
        });
      };
      a.getTranslatedLanguageList = function(videoId, callback, error){
        ytcenter.utils.xhr({
          url: ytcenter.protocol + "video.google.com/timedtext?type=list&tlangs=1&v=" + encodeURIComponent(videoId),
          method: "GET",
          onload: function(response){
            var doc = ytcenter.utils.parseXML(response.responseText);
            if (callback) callback(doc);
          },
          onerror: function(){
            con.error("[Subtitles] Couldn't load subtitle list for video (" + videoId + ")");
            if (error) error();
          }
        });
      };
      a.getSubtitleLanguage = function(videoId, langName, langCode, translateLang, callback, error){
        ytcenter.utils.xhr({
          url: ytcenter.protocol + "video.google.com/timedtext?type=track&v=" + encodeURIComponent(videoId)
               + (langName ? "&name=" + encodeURIComponent(langName) : "")
               + (langCode ? "&lang=" + encodeURIComponent(langCode) : "")
               + (translateLang ? "&tlang=" + encodeURIComponent(translateLang) : ""),
          method: "GET",
          onload: function(response){
            var doc = ytcenter.utils.parseXML(response.responseText);
            if (callback) callback(doc);
          },
          onerror: function(){
            con.error("[Subtitles] Couldn't load subtitle list for video (" + videoId + ")");
            if (error) error();
          }
        });
      };
      
      return a;
    })();
    ytcenter.commentsLoader = (function(){
      function createLoadCommentsButton() {
        var el = document.createElement("div");
        el.className = "yt-card yt-card-has-padding";
        
        var btn = document.createElement("button");
        btn.className = "yt-uix-button yt-uix-button-size-default yt-uix-button-expander";
        btn.setAttribute("type", "button");
        btn.setAttribute("onclick", ";return false;");
        btn.style.borderTop = "none";
        btn.style.margin = "-10px 0 -10px";
        
        btn.addEventListener("click", showCommentsFunc, false);
        
        var btnText = document.createElement("span");
        btnText.className = "yt-uix-button-content";
        btnText.textContent = ytcenter.language.getLocale("LOAD_COMMENTS_TEXT");
        ytcenter.events.addEvent("language-refresh", function(){
          btnText.textContent = ytcenter.language.getLocale("LOAD_COMMENTS_TEXT");
        });
        
        btn.appendChild(btnText);
        
        el.appendChild(btn);
        
        return el;
      }
      
      function fixWidth() {
        var iframe = discussionElement.getElementsByTagName("iframe");
        iframe = iframe.length > 0 ? iframe[0] : null;
        
        var container = discussionElement.getElementsByClassName("comments-iframe-container");
        container = container.length > 0 ? container[0] : null;
        
        if (iframe && container) {
          iframe.style.width = container.offsetWidth + "px";
        }
      }
      
      function showCommentsFunc() {
        if (discussionElement && loadCommentsElement && loadCommentsElement.parentNode) {
          discussionElement.style.display = "";
          
          showComments = true;
          
          if (discussionElement.parentNode) {
            loadCommentsElement.parentNode.removeChild(loadCommentsElement);
          } else {
            loadCommentsElement.parentNode.replaceChild(discussionElement, loadCommentsElement);
          }
          
          setTimeout(function(){
            if (uw.yt && uw.yt.pubsub && uw.yt.pubsub.publish) {
              uw.yt.pubsub.publish("page-resize", ytcenter.utils.getViewPort());
            }
            fixWidth();
          }, 7);
        }
      }
      
      function update() {
        var scrolldetect = discussionElement.getAttribute("data-scrolldetect-callback");
        if (scrolldetect) {
          observer.disconnect();
          observer = null;
          
          if (!showComments) {
            discussionElement.parentNode.removeChild(discussionElement);
          }
        }
      }
      
      function setup() {
        if (ytcenter.page === "watch" && !ytcenter.settings.enableComments) {
          showComments = false;
          loadCommentsElement = createLoadCommentsButton();
          discussionElement = document.getElementById("watch-discussion");
          if (discussionElement && discussionElement.parentNode) {
            discussionElement.style.display = "none";
            //discussionElement.style.visibility = "hidden";
            if (observer) {
              observer.disconnect();
              observer = null;
            }
            observer = ytcenter.mutation.observe(discussionElement, { childList: true, subtree: true }, update);
            
            discussionElement.parentNode.appendChild(loadCommentsElement);
            
            /*discussionElement.parentNode.replaceChild(loadCommentsElement, discussionElement);*/
            
            /*discussionElement.parentNode.removeChild(discussionElement);*/
          }
        }
      }
      
      var loadCommentsElement = null;
      var discussionElement = null;
      
      var observer = null;
      var observerWidthFix = null;
      
      var showComments = false;
      
      var exports = {};
      exports.setup = setup;
      
      return exports;
    })();


    /*> comments_plus.js */
    /*> uploader_flag.js */
    /*> flag_helper.js */

    ytcenter.getPage = function(url){
      url = url || loc.href;
      var pathname = (url && url.split("youtube.com")[1]) || loc.pathname;
      if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\/watch\?/)) {
        ytcenter.page = "watch";
      } else if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\/all_comments\?/)) {
        ytcenter.page = "all_comments";
      } else if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\/edit\?/)) {
        ytcenter.page = "edit";
      } else if (!!url.match(/^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/)) {
        ytcenter.page = "comments";
      } else if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\//) && (loc.pathname === "/" || loc.pathname === "/feed/what_to_watch")) {
        ytcenter.page = "feed_what_to_watch";
      } else if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\/embed\//) || !!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\/watch_popup\?\//)) {
        ytcenter.page = "embed";
      } else if ( document &&
                  document.body &&
                  document.body.innerHTML.indexOf("data-swf-config") !== -1 &&
                  document.body.innerHTML.indexOf("movie_player") !== -1 &&
                  document.body.innerHTML.indexOf("youtube.com/v/") !== -1 &&
                  document.body.innerHTML.indexOf("flashvars=") !== -1) {
        ytcenter.page = "channel";
      } else if (document.getElementById("page") && ytcenter.utils.hasClass(document.getElementById("page"), "channel")) {
        ytcenter.page = "channel";
      } else if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\/(user|channel|u|c)\//)) {
        ytcenter.page = "channel";
      } else if (!!url.match(/^http(s)?:\/\/(www\.)?youtube\.com\//)) {
        if (loc.pathname === "/results") {
          ytcenter.page = "search";
        } else {
          ytcenter.page = "other";
        }
      }
      return ytcenter.page;
    };
    ytcenter.pageReadinessListener = (function(){
      function call(event){
        for (i = 0; i < events.length; i++) {
          if (events[i].event === event) {
            con.log("[PageReadinessListener] Calling => " + events[i].event);
            for (j = 0; j < events[i].callbacks.length; j++) {
              events[i].callbacks[j]();
            }
          }
        }
      }
      function addEventListener(event, callback){
        var i;
        for (i = 0; i < events.length; i++) {
          if (events[i].event === event) {
            if (!events[i].callbacks) events[i].callbacks = [];
            events[i].callbacks.push(callback);
            return;
          }
        }
      }
      function update(){
        var i, j, page = ytcenter.getPage(loc.href);
        if (ytcenter.pageReadinessListener.waitfor) {
          if (!ytcenter.pageReadinessListener.waitfor()) return;
        }
        
        for (i = 0; i < events.length; i++) {
          if (events[i].called) continue;
          if (events[i].test && !events[i].test()) break;
          events[i].called = true;
          
          if (events[i].event === "stopInterval") {
            con.log("[PageReadinessListener] Stopping interval");
            uw.clearInterval(preTester);
            ytcenter.utils.removeEventListener(document, "readystatechange", update, true);
            ytcenter.utils.removeEventListener(document, "DOMContentLoaded", update, true);
            events = null;
            preTester = null;
            preTesterInterval = null;
            update = null;
            return;
          } else if (events[i].event === "startInterval") {
            con.log("[PageReadinessListener] Starting interval");
            uw.clearInterval(preTester); // Just to make sure that only one instance is running.
            preTester = uw.setInterval(function(){
              update();
            }, preTesterInterval);
          } else {
            con.log("[PageReadinessListener] At event => " + events[i].event, page);
            events[i].called = true;
            for (j = 0; j < events[i].callbacks.length; j++) {
              events[i].callbacks[j](page);
            }
          }
        }
      };
      function setup(){
        ytcenter.utils.addEventListener(document, "readystatechange", update, true);
        ytcenter.utils.addEventListener(document, "DOMContentLoaded", update, true);
        preTester = uw.setInterval(function(){
          update();
        }, preTesterInterval);
        
        update();
      }
      
      var events = [
        {
          event: "headerInitialized",
          test: function(){
            if (document && document.getElementsByTagName && document.getElementsByTagName("head")[0])
              return true;
            return false;
          },
          called: false,
          callbacks: []
        }, {
          event: "bodyInitialized",
          test: function(){
            if (document && document.body && (document.body.className !== "" || ytcenter.feather))
              return true;
            return false;
          },
          called: false,
          callbacks: []
        }, {
          event: "bodyInteractive", test: function(){
            if (document.readyState === "interactive" || document.readyState === "complete")
              return true;
            return false;
          },
          called: false,
          callbacks: []
        }, {
          event: "bodyComplete", test: function(){
            if (document.readyState === "complete")
              return true;
            return false;
          },
          called: false,
          callbacks: []
        }, {
          event: "stopInterval",
          called: false,
          callbacks: []
        }
      ];
      var preTester;
      var preTesterInterval = 75;
      
      return {
        setup: setup,
        update: update,
        addEventListener: addEventListener,
        call: call,
      };
    })();

    /*> thumbnail.js */
    
    ytcenter.getDebug = function(stringify){
      if (typeof stringify !== "boolean") stringify = true;
      var debugText = "{}", dbg = {}, a;
      var api = ytcenter.player.getAPI();
      try {
        dbg.htmlelements = {};
        if (document.body)
          dbg.htmlelements.body = { "className": document.body.className };
        dbg.injected = injected;
        dbg.identifier = identifier;
        dbg.devbuild = devbuild; // variable is true if this a developer build
        dbg.devnumber = devnumber; // developer build number. Only really needed for the developer build.
        dbg.feather = ytcenter.feather;
        dbg.cookies = {};
        dbg.cookies["VISITOR_INFO1_LIVE"] = ytcenter.utils.getCookie("VISITOR_INFO1_LIVE");
        dbg.location = {
          hash: loc.hash,
          host: loc.host,
          hostname: loc.hostname,
          href: loc.href,
          origin: loc.origin,
          pathname: loc.pathname,
          port: loc.port,
          protocol: loc.protocol,
          search: loc.search
        };
        dbg.navigator = {
          userAgent: uw.navigator.userAgent,
          vendor: uw.navigator.vendor,
          vendorSub: uw.navigator.vendorSub,
          platform: uw.navigator.platform
        };
        dbg.settings = {};
        for (a in ytcenter.settings) {
          if (ytcenter.settings.hasOwnProperty(a)) {
            if (ytcenter.settings.debug_settings_playersize && a === "resize-playersizes") continue;
            if (ytcenter.settings.debug_settings_buttonPlacement && (a === "buttonPlacement" || a === "buttonPlacementWatch7")) continue;
            if (ytcenter.settings.debug_settings_videoThumbnailData && a === "videoThumbnailData") continue;
            if (ytcenter.settings.debug_settings_commentCountryData && a === "commentCountryData") continue;
            if (ytcenter.settings.debug_settings_watchedVideos && a === "watchedVideos") continue;
            if (ytcenter.settings.debug_settings_notwatchedVideos && a === "notwatchedVideos") continue;
            dbg.settings[a] = ytcenter.settings[a];
          }
        }
        
        dbg.settings = ytcenter.settings;
        dbg.ytcenter = {};
        dbg.ytcenter.video = ytcenter.video;
        dbg.ytcenter.signatureDecipher = ytcenter.utils._signatureDecipher;
        dbg.ytcenter._signatureDecipher = ytcenter.utils.__signatureDecipher;
        dbg.ytcenter.player = {};
        dbg.ytcenter.player.flashvars = "";
        try {
          dbg.ytcenter.player.flashvars = document.getElementById("movie_player").getAttribute("flashvars");
        } catch (e) {
          dbg.ytcenter.player.flashvars = e;
        }
        dbg.ytcenter.player.config = ytcenter.player.config;
        try {
          dbg.ytcenter.player.apiinterface = api.getApiInterface();
        } catch (e) {
          dbg.ytcenter.player.apiinterface = {};
        }
        if (typeof dbg.ytcenter.player.reference !== "undefined") {
          dbg.ytcenter.player.reference = true;
        } else {
          dbg.ytcenter.player.reference = false;
        }
        
        try {
          dbg.player_test = {};
          for (var key in api) {
            if (key.indexOf("is") !== 0 && key.indexOf("get") !== 0) {
              dbg.player_test[key] = "IGNORED";
              continue;
            }
            if (api.hasOwnProperty(key)) {
              try {
                dbg.player_test[key] = api[key]();
              } catch (e) {
                dbg.player_test[key] = e;
              }
            }
          }
        } catch (e) {
          dbg.player_test_error = "ERROR";
        }
        
        dbg.console = _console;
        
        if (stringify) {
          debugText = JSON.stringify(dbg);
        } else {
          debugText = dbg;
        }
      } catch (e) {
        con.error(e);
        con.log("[Debug Text]", dbg);
        debugText = e.message;
      }
      return debugText;
    };
    ytcenter.alert = function(type, message, closeable){
      var exports = {},
          types = {
            "error": "yt-alert-error",
            "warning": "yt-alert-warning",
            "info": "yt-alert-info"
          },
          wrapper = document.createElement("div"),
          icon = document.createElement("div"),
          iconImg = document.createElement("img"),
          content = document.createElement("div"),
          contentVerticalTrick = document.createElement("span"),
          contentMessage = document.createElement("div");
      closeable = typeof closeable === "boolean" ? closeable : true;
      wrapper.className = "yt-alert yt-alert-default " + types[type];
      
      icon.className = "yt-alert-icon";
      iconImg.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
      iconImg.className = "icon master-sprite";
      
      icon.appendChild(iconImg);
      wrapper.appendChild(icon);
      
      if (closeable) {
        var buttons = document.createElement("div"),
            closeButton = document.createElement("button"),
            closeButtonText = document.createElement("span");
        buttons.className = "yt-alert-buttons";
        closeButton.setAttribute("type", "button");
        closeButton.setAttribute("role", "button");
        closeButton.setAttribute("onclick", ";return false;");
        closeButton.className = "close yt-uix-close yt-uix-button yt-uix-button-close";
        ytcenter.utils.addEventListener(closeButton, "click", function(){
          exports.setVisibility(false);
        });
        
        closeButtonText.className = "yt-uix-button-content";
        closeButtonText.textContent = "Close ";
        closeButton.appendChild(closeButtonText);
        buttons.appendChild(closeButton);
        wrapper.appendChild(buttons);
      }
      
      content.className = "yt-alert-content";
      
      contentVerticalTrick.className = "yt-alert-vertical-trick";
      
      contentMessage.className = "yt-alert-message";
      
      if (typeof message === "string") {
        contentMessage.textContent = message;
      } else {
        contentMessage.appendChild(message);
      }
      
      
      content.appendChild(contentVerticalTrick);
      content.appendChild(contentMessage);
      wrapper.appendChild(content);
      
      exports.setVisibility = function(visible){
        if (visible) {
          if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
          document.getElementById("alerts").appendChild(wrapper);
        } else {
          if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        }
      };
      
      return exports;
    };
    ytcenter.message = (function(){
      var exports = {};
      
      exports.listen = function(win, origin, token, callback){
        ytcenter.utils.addEventListener(win || uw, "message", function(e){
          if (origin && e.origin !== origin) return;
          if (!e || !e.data) return; // Checking if data is present
          if (typeof e.data !== "string") return; // Checking if the object is a string.
          if (!e.data.indexOf || e.data.indexOf(token) !== 0) return; // Checking if the token is present at the start of the string
          
          var data = JSON.parse(e.data.substring(token.length));
          //con.log("[Message:" + loc.href + "] Listen@" + token, data);
          callback(data);
        }, false);
      };
      
      exports.broadcast = function(win, origin, token, data){
        win.postMessage(token + JSON.stringify(data), origin);
      };
      return exports;
    })();
    ytcenter.domEvents = (function(){
      function onViewUpdate(e) {
		if (e && e.detail === "ytcenter") return;
        if (uw.self !== uw.top && !offset && !windowDim)
          return;
        onEnterViewUpdate();
        onExitViewUpdate();
        
        var i, elms = document.getElementsByTagName("iframe"), scrollOffset = null, elmOffset = null, data;
        for (i = 0; i < elms.length; i++) {
          if (elms[i] && elms[i].src && (elms[i].src.indexOf("http://apis.google.com/") === 0 || elms[i].src.indexOf("https://apis.google.com/") === 0 || elms[i].src.indexOf("http://plus.googleapis.com") === 0 || elms[i].src.indexOf("https://plus.googleapis.com") === 0) && elms[i].src.indexOf("/widget/render/comments?") !== -1) {
            scrollOffset = ytcenter.utils.getBoundingClientRect(elms[i]);
            data = { scrollOffset: scrollOffset, windowDim: windowDim || {width: window.innerWidth || document.documentElement.clientWidth, height: window.innerHeight || document.documentElement.clientHeight } };
            ytcenter.message.broadcast(
              elms[i].contentWindow,
              elms[i].src,
              "$_scroll",
              data
            );
          }
        }
      }
      function onEnterViewUpdate() {
        if (!db["enterview"]) return;
        var trash = [], i = 0, a;
        while (i < db["enterview"].length) {
          if (processEnterViewUpdate(db["enterview"][i])) {
            if (db["enterview"][i].once) {
              db["enterview"].splice(i, 1);
              i -= 1;
            }
          }
          i += 1;
        }
      }
      function onExitViewUpdate() {
        if (!db["exitview"]) return;
        var trash = [], i = 0, a;
        while (i < db["exitview"].length) {
          if (processExitViewUpdate(db["exitview"][i])) {
            if (db["exitview"][i].once) {
              db["exitview"].splice(i, 1);
              i -= 1;
            }
          }
          i += 1;
        }
      }
      function processEnterViewUpdate(item) {
        if (item.element) {
          var inView = ytcenter.utils.isElementPartlyInView(item.element, offset, windowDim);
          if (!inView) {
            item.inview = false;
            return false;
          }
          if (!("inview" in item)) item.inview = false;
          if (item.inview) return false;
          item.inview = true;
          item.callback.apply(item.element, []);
          return true;
        } else if (item.collection) {
          var items = item.collection;
          
          var inViewItems = [];
          for (var i = 0, len = item.collection.length; i < len; i++) {
            var inview = ytcenter.utils.isElementPartlyInView(items[i].wrapper, offset, windowDim);
            if (inview) {
              inViewItems.push(item.collection[i]);
              item.collection.splice(i, 1);
              i--; len--;
            }
          }
          
          item.callback.call(null, inViewItems);
          
          return (item.collection.length === 0);
        }
      }
      function processExitViewUpdate(item) {
        if (item.element) {
          var inView = ytcenter.utils.isElementPartlyInView(item.element, offset, windowDim);
          if (inView) {
            item.inview = true;
            return false;
          }
          if (!("inview" in item)) {
            item.inview = inView;
            return false;
          }
          if (item.inview && !inView) {
            item.callback.apply(item.element, []);
          }
          item.inview = inView;
          return true;
        } else if (item.collection) {
          return false;
        }
      }
      var exports = {}, db = {}, _buffer = null, onViewUpdateBuffer = null, offset = null, windowDim = null;
      
      exports.update = function(){
        onViewUpdate();
      };
      exports.addEvent = function(elm, event, callback, once){
        if (!elm) return;
        if (!db[event]) db[event] = [];
        
        if (ytcenter.utils.isArray(elm)) {
          db[event].push({
            collection: elm,
            callback: callback,
            once: once || false
          });
        } else {
          db[event].push({
            element: elm,
            inview: false,
            callback: callback,
            once: once || false
          });
        }
      };
      
      exports.ready = function(){
        if (uw.self === uw.top) return;
        if ((loc.href.indexOf("apis.google.com/u/") !== -1 || loc.href.indexOf("plus.googleapis.com") !== -1) && loc.href.indexOf("/widget/render/comments?") !== -1) {
          ytcenter.message.broadcast(
            uw.parent,
            document.referrer,
            "$_ready",
            {}
          );
        }
      };
      
      exports.setup = function(){
        if (onViewUpdateBuffer) {
          ytcenter.utils.removeEventListener(window, "scroll", onViewUpdateBuffer, false);
          ytcenter.utils.removeEventListener(window, "resize", onViewUpdateBuffer, false);
          ytcenter.events.removeEvent("ui-refresh", onViewUpdateBuffer);
        } else {
          if ((loc.href.indexOf("apis.google.com/u/") !== -1 || loc.href.indexOf("plus.googleapis.com") !== -1) && loc.href.indexOf("/widget/render/comments?") !== -1) {
            ytcenter.message.listen(uw, null, "$_scroll", function(data){
              offset = data.scrollOffset;
              windowDim = data.windowDim;
            });
          }
          if (ytcenter.getPage() === "watch") {
            ytcenter.message.listen(uw, null, "$_ready", function(data){
              onViewUpdate();
            });
          }
        }
        onViewUpdateBuffer = ytcenter.utils.throttle(onViewUpdate, 500);
        
        ytcenter.utils.addEventListener(window, "scroll", onViewUpdateBuffer, false);
        ytcenter.utils.addEventListener(window, "resize", onViewUpdateBuffer, false);
        ytcenter.events.addEvent("ui-refresh", onViewUpdateBuffer);
        uw.setInterval(onViewUpdateBuffer, 7500); // Todo attach this to an event instead.
        
        onViewUpdateBuffer();
      };
      
      return exports;
    })();
    ytcenter.scrollEvent = (function(){
      function createHandler(group) {
        return function(event){
          var data = handler(event),
            i;
          for (i = 0; i < group.listeners.length; i++) {
            group.listeners[i].apply(group.element, data);
          }
        };
      }
      function addEventListener(elm, listener) {
        var group = getEventGroup(elm);
        
        if (group === null) {
          group = {
            element: elm,
            listeners: [],
            handler: null
          };
          groups.push(group);
        }
        
        group.listeners.push(listener);
        
        if (group.listeners.length > 0 && group.handler === null) {
          setupGroup(group);
        }
      }
      function removeEventListener(elm, listener) {
        var group = getEventGroup(elm),
          i;
        if (group !== null) {
          for (i = 0; i < group.listeners.length; i++) {
            if (group.listeners[i] === listener) {
              group.listeners.splice(i, 1);
            }
          }
          if (group.listeners.length === 0 && group.handler !== null) {
            destroyGroup(group);
          }
        }
      }
      function getEventGroup(elm) {
        var i;
        for (i = 0; i < groups.length; i++) {
          if (groups[i].element === elm) {
            return groups[i];
          }
        }
        return null;
      }
      function setupGroup(group) {
        var i;
        if (group.handler === null) {
          group.handler = createHandler(group);
          for (i = 0; i < events.length; i++) {
            ytcenter.utils.addEventListener(group.element, events[i], group.handler, false);
          }
        }
      }
      function destroyGroup(group) {
        var i;
        if (group.handler !== null) {
          for (i = 0; i < events.length; i++) {
            ytcenter.utils.removeEventListener(group.element, events[i], group.handler, false);
          }
          group.handler = null;
        }
      }
      function setup() {
        var i;
        for (i = 0; i < groups.length; i++) {
          setupGroup(groups[i]);
        }
      }
      function destroy() {
        var i;
        for (i = 0; i < groups.length; i++) {
          destroyGroup(groups[i]);
        }
      }
      function unload() {
        destroy();
        groups = [];
      }
      
      function handler(event) {
        var orgEvent = event || window.event;
        var args = Array.prototype.splice.call(arguments, 1);
        var delta = 0;
        var deltaX = 0;
        var deltaY = 0;
        var absDelta = 0;
        var absDeltaXY = 0;
        var fn = null;
        
        // Old school scrollwheel delta
        if (orgEvent.wheelDelta) {
          delta = orgEvent.wheelDelta;
        }
        if (orgEvent.detail) {
          delta = orgEvent.detail * -1;
        }

        // New school wheel delta (wheel event)
        if (orgEvent.deltaY) {
          deltaY = orgEvent.deltaY * -1;
          delta  = deltaY;
        }
        if (orgEvent.deltaX) {
          deltaX = orgEvent.deltaX;
          delta  = deltaX * -1;
        }

        // Webkit
        if (orgEvent.wheelDeltaY !== undefined) {
          deltaY = orgEvent.wheelDeltaY;
        }
        if (orgEvent.wheelDeltaX !== undefined) {
          deltaX = orgEvent.wheelDeltaX * -1;
        }

        // Look for lowest delta to normalize the delta values
        absDelta = Math.abs(delta);
        if (!lowestDelta || absDelta < lowestDelta) {
          lowestDelta = absDelta;
        }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
          lowestDeltaXY = absDeltaXY;
        }

        fn = delta > 0 ? "floor" : "ceil";
        delta  = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        deltaY = Math[fn](deltaY / lowestDeltaXY);
        
        return [event, delta, deltaX, deltaY];
      }
      var events = 'onwheel' in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
        lowestDelta = null,
        lowestDeltaXY = null,
        groups = [];
      return {
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        destroy: destroy,
        setup: setup,
        unload: unload
      };
    })();

    /*> events.js */
    
    ytcenter._dialogVisible = null
    ytcenter.dialog = function(titleLabel, content, actions, alignment){
      var exports = {}, ___parent_dialog = null, bgOverlay, root, base, fg, fgContent, footer, eventListeners = {}, actionButtons = {}, _visible = false;
      var buttons = [];
      
      alignment = alignment || "center";
      
      bgOverlay = ytcenter.dialogOverlay();
      root = document.createElement("div");
      root.className = "ytcenter-dialog";
      base = document.createElement("div");
      base.className = "ytcenter-dialog-base";
      
      fg = document.createElement("div");
      fg.className = "ytcenter-dialog-fg";
      fgContent = document.createElement("div");
      fgContent.className = "ytcenter-dialog-fg-content ytcenter-dialog-show-content";
      fg.appendChild(fgContent);
      
      
      if (alignment === "center") {
        var align = document.createElement("span");
        align.className = "ytcenter-dialog-align";
        base.appendChild(align);
      } else {
        fg.style.margin = "13px 0";
      }
      
      base.appendChild(fg);
      root.appendChild(base);
      
      if (typeof titleLabel === "string" && titleLabel !== "") {
        var header = document.createElement("div");
        header.className = "ytcenter-dialog-header";
        var title = document.createElement("h2");
        title.className = "ytcenter-dialog-title";
        title.textContent = ytcenter.language.getLocale(titleLabel);
        ytcenter.language.addLocaleElement(title, titleLabel, "@textContent");
        
        header.appendChild(title);
        fgContent.appendChild(header);
      } else {
        var header = document.createElement("div");
        header.style.margin = "0 -20px 20px";
        fgContent.appendChild(header);
      }
      if (typeof content !== "undefined") {
        var cnt = document.createElement("div");
        cnt.className = "ytcenter-dialog-content";
        cnt.appendChild(content);
        fgContent.appendChild(cnt);
      }
      footer = document.createElement("div");
      footer.className = "ytcenter-dialog-footer";
      fgContent.appendChild(footer);
      if (typeof actions !== "undefined") {
        /* Array
         *   Object
         *     label: "",
         *     primary: false, # Should be the primary button.
         *     callback: Function
         */
        for (var i = 0; i < actions.length; i++) {
          var btn = document.createElement("button");
          buttons.push(btn);
          btn.setAttribute("type", "button");
          btn.setAttribute("role", "button");
          btn.setAttribute("onclick", ";return false;");
          btn.className = "yt-uix-button " + (actions[i].primary ? "yt-uix-button-primary" : "yt-uix-button-default");
          if (typeof actions[i].callback === "function") {
            ytcenter.utils.addEventListener(btn, "click", actions[i].callback, false);
          }
          var btnContent = document.createElement("span");
          btnContent.className = "yt-uix-button-content";
          btnContent.textContent = ytcenter.language.getLocale(actions[i].label);
          ytcenter.language.addLocaleElement(btnContent, actions[i].label, "@textContent");
          
          btn.appendChild(btnContent);
          footer.appendChild(btn);
          
          if (actions[i].name) actionButtons[actions[i].name] = btn;
        }
      } else { // Default
        var closeBtn = document.createElement("button");
        buttons.push(closeBtn);
        closeBtn.setAttribute("type", "button");
        closeBtn.setAttribute("role", "button");
        closeBtn.setAttribute("onclick", ";return false;");
        closeBtn.className = "yt-uix-button yt-uix-button-default";
        
        ytcenter.utils.addEventListener(closeBtn, "click", function(){
          exports.setVisibility(false);
        }, false);
        
        var closeContent = document.createElement("span");
        closeContent.className = "yt-uix-button-content";
        closeContent.textContent = ytcenter.language.getLocale("DIALOG_CLOSE");
        ytcenter.language.addLocaleElement(closeContent, "DIALOG_CLOSE", "@textContent");
        
        closeBtn.appendChild(closeContent);
        footer.appendChild(closeBtn);
        actionButtons['close'] = btn;
      }
      exports.getActionButton = function(name){
        return actionButtons[name];
      };
      exports.addEventListener = function(eventName, func){
        if (!eventListeners.hasOwnProperty(eventName)) eventListeners[eventName] = [];
        eventListeners[eventName].push(func);
        return eventListeners[eventName].length - 1;
      };
      exports.removeEventListener = function(eventName, index){
        if (!eventListeners.hasOwnProperty(eventName)) return;
        if (index < 0 && index >= eventListeners[eventName].length) return;
        eventListeners[eventName].splice(index, 1);
      };
      exports.setWidth = function(width){
        fg.style.width = width;
      };
      exports.getRoot = function(){
        return root;
      };
      exports.getBase = function(){
        return base;
      };
      exports.getContent = function(){
        return cnt;
      };
      exports.getFooter = function(){
        return footer;
      };
      exports.getHeader = function(){
        return header;
      };
      exports.setPureVisibility = function(visible){
        if (visible) {
          if (!root.parentNode) document.body.appendChild(root);
          else {
            root.parentNode.removeChild(root);
            document.body.appendChild(root);
          }
          if (!bgOverlay.parentNode) document.body.appendChild(bgOverlay);
          else {
            bgOverlay.parentNode.removeChild(bgOverlay);
            document.body.appendChild(bgOverlay);
          }
          if (document.getElementById("player-api-legacy") || document.getElementById("player-api")) (document.getElementById("player-api-legacy") || document.getElementById("player-api")).style.visibility = "hidden";
        } else {
          if (root.parentNode) root.parentNode.removeChild(root);
          if (bgOverlay.parentNode) bgOverlay.parentNode.removeChild(bgOverlay);
          if ((document.getElementById("player-api-legacy") || document.getElementById("player-api")) && !___parent_dialog) (document.getElementById("player-api-legacy") || document.getElementById("player-api")).style.visibility = "";
        }
      };
      exports.setFocus = function(focus){
        if (!base) {
          con.error("[Dialog.setFocus] base element was not found!");
          return;
        }
        if (focus) {
          base.style.zIndex = "";
        } else {
          base.style.zIndex = "1998";
        }
      };
      exports.setVisibility = function(visible){
        if (_visible === visible) return;
        _visible = visible;
        if (eventListeners["visibility"]) {
          for (var i = 0; i < eventListeners["visibility"].length; i++) {
            eventListeners["visibility"][i](visible);
          }
        }
        if (visible) {
          if (document.body) ytcenter.utils.addClass(document.body, "ytcenter-dialog-active");
          ___parent_dialog = ytcenter._dialogVisible;
          if (___parent_dialog) {
            ___parent_dialog.setFocus(false);
          }
          exports.setPureVisibility(true);
          
          ytcenter._dialogVisible = exports;
        } else {
          exports.setPureVisibility(false);
          
          if (___parent_dialog) {
            ___parent_dialog.setFocus(true);
            ytcenter._dialogVisible = ___parent_dialog;
          } else {
            ytcenter._dialogVisible = null;
            if (document.body) ytcenter.utils.removeClass(document.body, "ytcenter-dialog-active");
          }
        }
      };
      exports.setButtonsEnabled = function(enabled){
        for (var i = 0, len = buttons.length; i < len; i++) {
          buttons[i].disabled = !enabled;
        }
      };
      exports.isVisible = function(){
        return _visible;
      };
      return exports;
    };
    ytcenter.dialogOverlay = function(){
      var bg = document.createElement("div");
      bg.id = "ytcenter-dialog-bg";
      bg.className = "ytcenter-dialog-bg";
      bg.style.height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) + "px";
      bg.style.position = "absolute";
      return bg;
    };
    ytcenter.confirmBox = function(titleLabel, messageLabel, onConfirm, confirmLabel){ // Only being used for the resizeitemlist
      confirmLabel = confirmLabel || "EMBED_RESIZEITEMLIST_CONFIRM_DISCARD";
      var msgElm = document.createElement("h3");
      msgElm.style.fontWeight = "normal";
      msgElm.textContent = ytcenter.language.getLocale(messageLabel);
      ytcenter.language.addLocaleElement(msgElm, messageLabel, "@textContent");
      
      var dialog = ytcenter.dialog(titleLabel, msgElm, [
        {
          label: "CONFIRM_CANCEL",
          primary: false,
          callback: function(){
            try {
              onConfirm(false);
              dialog.setVisibility(false);
            } catch (e) {
              con.error(e);
            }
          }
        }, {
          label: confirmLabel,
          primary: true,
          callback: function(){
            try {
              onConfirm(true);
              dialog.setVisibility(false);
            } catch (e) {
              con.error(e);
            }
          }
        }
      ]);
      dialog.setVisibility(true);
    };
    ytcenter.welcome = (function(){
      function update() {
        return ytcenter.utils.replaceText(ytcenter.language.getLocale("WELCOME_CONTENT"),
          {
            "{lb}": function(){
              return document.createElement("br");
            },
            "{sectionbreak}": function(){
              var c = document.createElement("div");
              c.style.marginTop = "40px";
              return c;
            },
            "{img1}": img1,
            "{wiki-url}": wikilink,
            "{donate}": donatelink
          }
        );
      }
      var a = {}, dialog, b = document.createElement("div"),
          img1 = document.createElement("div"), img1src = document.createElement("img"), wikilink = document.createElement("a"), donatelink = document.createElement("a");
      img1.className = "ytcenter-image-welcome-settings-repeater";
      img1src.className = "ytcenter-image-welcome-settings clearfix";
      img1src.style.cssFloat = "right";
      img1src.style.backgroundPosition = "right";
      img1src.style.width = "100%";
      img1src.src = "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif";
      img1.appendChild(img1src);
      wikilink.href = "https://github.com/YePpHa/YouTubeCenter/wiki";
      wikilink.setAttribute("target", "_blank");
      donatelink.href = "https://github.com/YePpHa/YouTubeCenter/wiki/Donate";
      donatelink.setAttribute("target", "_blank");
      a.createDialog = function(){
        if (dialog) return;
        donatelink.textContent = ytcenter.language.getLocale("WELCOME_CONTENT_DONATE");
        ytcenter.language.addLocaleElement(donatelink, "WELCOME_CONTENT_DONATE", "@textContent");
        wikilink.textContent = ytcenter.language.getLocale("WELCOME_CONTENT_WIKI");
        ytcenter.language.addLocaleElement(wikilink, "WELCOME_CONTENT_WIKI", "@textContent");
        ytcenter.events.addEvent("language-refresh", function(){
          b.innerHTML = "";
          b.appendChild(update());
        });
        b.appendChild(update());
        dialog = ytcenter.dialog("WELCOME_TITLE", b, [
          {
            label: "DIALOG_CLOSE",
            primary: false,
            callback: function(){
              try {
                a.setLaunchStatus(true);
                a.setVisibility(false);
              } catch (e) {
                con.error(e);
              }
            }
          }, {
            label: "WELCOME_CONFIRM_SETTINGS",
            primary: true,
            callback: function(){
              try {
                a.setLaunchStatus(true);
                a.setVisibility(false);
                if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
                ytcenter.settingsPanelDialog.setVisibility(true);
              } catch (e) {
                con.error(e);
              }
            }
          }
        ]);
        dialog.setWidth("530px");
      };
      
      a.setLaunchStatus = function(launch){
        ytcenter.settings['welcome_launched'] = launch;
        ytcenter.saveSettings();
      };
      a.hasBeenLaunched = function(){
        return ytcenter.settings['welcome_launched'] ? true : false;
      };
      a.setVisibility = function(visible){
        a.createDialog();
        
        if (visible) {
          ytcenter.utils.addClass(document.body, "player-disable");
        } else {
          ytcenter.utils.removeClass(document.body, "player-disable");
        }
        dialog.setVisibility(visible);
      };
      
      return a;
    })();
    ytcenter.dragdrop = function(list){
      function mousemove(e) {
        if (!dragging) return;
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        
        var target = e.target;
        if (e && e.type.indexOf("touched") !== -1 && e.changedTouches && e.changedTouches.length > 0 && e.changedTouches[0]) {
          e = e.changedTouches[0];
        }
        
        var t = ytcenter.utils.toParent(target, "ytcenter-dragdrop-item");
        if (t === draggingElement || t === document.body || typeof t === "undefined") return;
        
        var offset = ytcenter.utils.getOffset(target, t);
        var top = (typeof e.offsetY === "undefined" ? e.layerY : e.offsetY) + offset.top;
        
        if (top > t.clientHeight/2) {
          if (t.nextSibling === draggingElement) return;
          ytcenter.utils.insertAfter(draggingElement, t);
        } else {
          if (t.previousSibling === draggingElement) return;
          t.parentNode.insertBefore(draggingElement, t);
        }
        
        ytcenter.utils.each(listeners.onDragging, function(i, callback){
          callback(getItemIndex(draggingElement) /* Current Index */, draggingIndex, draggingElement);
        });
        return false;
      }
      function mousedownListener(e) {
        if (!ytcenter.utils.hasClass(e.target, "ytcenter-dragdrop-handle")) return;
        if (!ytcenter.utils.hasChild(list, e.target)) return;
        draggingElement = ytcenter.utils.toParent(e.target, "ytcenter-dragdrop-item");
        if (typeof draggingElement === "undefined") return;
        
        dragging = true;
        
        ytcenter.utils.addClass(draggingElement, "ytcenter-dragdrop-dragging");
        ytcenter.utils.addClass(list, "ytcenter-dragdrop-indragging");
        ytcenter.utils.removeClass(list, "ytcenter-dragdrop-notdragging");
        
        draggingIndex = getItemIndex(draggingElement);
        
        ytcenter.utils.each(listeners.onDrag, function(i, callback){
          callback(draggingIndex, draggingElement);
        });
        throttleFunc = ytcenter.utils.throttle(mousemove, 50);
        ytcenter.utils.addEventListener(document, "mousemove", throttleFunc, false);
        ytcenter.utils.addEventListener(document, "touchmove", throttleFunc, false);
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      }
      function mouseupListener(e) {
        if (!dragging) return;
        
        dragging = false;
        
        ytcenter.utils.removeClass(draggingElement, "ytcenter-dragdrop-dragging");
        ytcenter.utils.removeClass(list, "ytcenter-dragdrop-indragging");
        ytcenter.utils.addClass(list, "ytcenter-dragdrop-notdragging");
        
        ytcenter.utils.each(listeners.onDrop, function(i, callback){
          callback(getItemIndex(draggingElement) /* Drop Index */, draggingIndex, draggingElement);
        });
        
        if (throttleFunc) ytcenter.utils.removeEventListener(document, "mousemove", throttleFunc);
        if (throttleFunc) ytcenter.utils.removeEventListener(document, "touchmove", throttleFunc);
        
        if (e && e.preventDefault) {
          e.preventDefault();
        } else {
          window.event.returnValue = false;
        }
        return false;
      }
      function getItemIndex(item) {
        for (var i = 0; i < list.children.length; i++) {
          if (list.children[i] === item) return i;
        }
        return -1;
      }
      var dragging = false;
      var draggingElement;
      var draggingIndex;
      var offset;
      var listeners = {
        onDrag: [],
        onDragging: [],
        onDrop: []
      };
      var throttleFunc = null;
      
      
      ytcenter.utils.addClass(list, "ytcenter-dragdrop-notdragging");
      
      ytcenter.utils.addEventListener(list, "mousedown", mousedownListener);
      ytcenter.utils.addEventListener(document, "mouseup", mouseupListener);
      
      ytcenter.utils.addEventListener(list, "touchstart", mousedownListener);
      ytcenter.utils.addEventListener(document, "touchend", mouseupListener);
      
      return {
        addEventListener: function(event, callback){
          if (typeof listeners[event] === "undefined") listeners[event] = [];
          listeners[event].push(callback);
        }
      };
    };
    ytcenter.style = {};
    ytcenter.style.update = function(){
      var containerWidth = 985,
          guideWidth = 175,
          guideOffset = 10,
          contentWidth = 640,
          sidebarOffset = 0;
      
      var pageWidth = containerWidth + 2*(guideWidth + guideOffset),
          sidebarWidth = containerWidth - contentWidth - sidebarOffset;
      
      // @media and screen (max-width: ...){...}
      
    };
    ytcenter.listeners = (function(){
      var exports = {};
      
      exports.addEvent = function(elm, event, callback, useCapture){
        if (elm.addEventListener) {
          elm.addEventListener(event, callback, useCapture || false);
        } else if (elm.attachEvent) {
          elm.attachEvent("on" + event, callback);
        }
      };
      
      return exports;
    })();

    /*> gui.js */

    ytcenter.listeners = (function(){
      var exports = {};
      
      exports.addEvent = function(elm, event, callback, useCapture){
        if (elm.addEventListener) {
          elm.addEventListener(event, callback, useCapture || false);
        } else if (elm.attachEvent) {
          elm.attachEvent("on" + event, callback);
        }
      };
      
      return exports;
    })();

    /*> modules.js */

    // @support
    ytcenter.supported = {};
    ytcenter.supported.localStorage = (function(){
      var mod = "ytc.supported";
      try {
        uw.localStorage.setItem(mod, mod);
        uw.localStorage.removeItem(mod);
        return true;
      } catch (e) {
        return false;
      }
    })();
    ytcenter.supported.CustomEvent = (function(){
      var mod = "support.test";
      try {
        var e = document.createEvent('CustomEvent');
        if (e && typeof e.initCustomEvent === "function") {
          e.initCustomEvent(mod, true, true, { mod: mod });
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    })();
    
    // @unsafeCall
    ytcenter.unsafeCall = (function(){
      function storeFunctions(obj) {
        if (Object.prototype.toString.call(obj) === "[object Array]") {
          var i;
          for (i = 0; i < obj.length; i++) {
            obj[i] = storeFunctions(obj[i]);
          }
        } else if (typeof obj === "function") {
          return comm.push(obj) - 1;
        } else if (obj === Object(obj)) {
          var key;
          for (key in obj) {
            if (obj.hasOwnProperty(key)) {
              obj[key] = storeFunctions(obj[key]);
            }
          }
        }
        return obj;
      }
      function call(method, args, callback) {
        var id = null;
        if (callback !== null) {
          id = comm.push(callback) - 1;
        }
        var detail = { id: id, method: method, arguments: storeFunctions(args) };
        
        if (ytcenter.supported.CustomEvent) {
          callEvent(detail);
        } else {
          callMessage(detail);
        }
      }
      
      function callMessage(detail) {
        detail.level = "unsafe";
        postMessage(JSON.stringify(detail));
      }
      
      function callEvent(detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent("ytc-content-call", true, true, JSON.stringify(detail));
        document.documentElement.dispatchEvent(event);
      }
      
      function resp(e) {
        if (!e || !e.data) return; // Checking if data is present
        if (typeof e.data !== "string") return; // Checking if the object is a string.
        if (!e.data.indexOf || e.data.indexOf("{") !== 0) return;
        
        var data = JSON.parse(e.data);
        if (data.level === "unsafe") return;
        
        if (typeof comm[data.id] === "function") {
          comm[data.id].apply(null, data.arguments);
        }
      }
      
      function eventResponse(e) {
        var detail = e.detail;
        if (typeof detail !== "object") detail = JSON.parse(detail);
        
        if (typeof comm[detail.id] === "function") {
          comm[detail.id].apply(null, detail.arguments);
        }
        
        if (e && typeof e.stopPropagation === "function") e.stopPropagation();
      }
      
      function postMessage(data) {
        window.postMessage(data, "*");
      }
      
      function initListeners() {
        if (ytcenter.supported.CustomEvent) {
          window.addEventListener("ytc-page-call", eventResponse, false);
        } else {
          window.addEventListener("message", resp, false);
        }
      }
      
      var comm = [];
      initListeners();
      
      return call;
    })();
    
    // @tabEvents
    ytcenter.tabEvents = (function(){
      /* Fire an event to the other tabs for Firefox */
      function fireEventFirefox() {
        ytcenter.unsafeCall("firefox_windowLinkerFireRegisteredEvent", Array.prototype.slice.call(arguments, 0));
      }
      
      function fireEventLocalStorage() {
        // Create a guid if a guid hasn't been created.
        if (!guid) guid = ytcenter.utils.guid();
        
        var locked = parseInt(uw.localStorage.getItem(STORAGE_LOCK) || 0, 10);
        var now = ytcenter.utils.now();
        var args = Array.prototype.slice.call(arguments, 0);
        
        if (locked && now - locked < STORAGE_TIMEOUT) {
          uw.setTimeout(ytcenter.utils.funcBind.apply(ytcenter.utils, [null, fireEventLocalStorage].concat(args)), STORAGE_WAIT);
        } else {
          hasLock = true;
          uw.localStorage.setItem(STORAGE_LOCK, now);
          uw.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            origin: guid,
            args: args
          }));
          
          cleanThrottle(); // wait x milliseconds until cleaning items
        }
      }
      
      /* The standard event handler, which every handler will call at the end. */
      function eventFired(event) {
        if (!listeners[event]) return;
        var args = Array.prototype.slice.call(arguments, 1);
        
        for (var i = 0, len = listeners[event].length; i < len; i++) {
          listeners[event][i].apply(null, args);
        }
      }
      
      /* Event handler for the localStorage */
      function eventFiredStorage(e) {
        e = e || uw.event;
        
        if (e.key === STORAGE_KEY) {
          var data = JSON.parse(e.newValue || "{}");
          if (data.origin !== guid) {
            eventFired.apply(null, data.args);
          }
        }
      }
      
      function clean() {
        if (hasLock) {
          hasLock = false;
          uw.localStorage.removeItem(STORAGE_LOCK);
          uw.localStorage.removeItem(STORAGE_KEY);
        }
      }
      
      /* Add an event listener to get information from other tabs */
      function addEventListener(event, callback) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
      }
      
      /* Remove the added event listener */
      function removeEventListener(event, callback) {
        if (!listeners[event]) return;
        for (var i = 0, len = listeners[event].length; i < len; i++) {
          listeners[event].splice(i, 1);
          break;
        }
      }
      
      /* Firefox replacement */
      function addWindowListener(callback) {
        ytcenter.unsafeCall("firefox_addWindowListener", [], callback);
      }
      
      /* Init the event handlers */
      function init() {
        if (firefox) {
          addWindowListener(eventFired); /* Firefox addon function */
        } else if (ytcenter.supported.localStorage) {
          if (typeof uw.addEventListener === "function") {
            uw.addEventListener("storage", eventFiredStorage, false);
          } else if (typeof uw.attachEvent === "function") {
            uw.attachEvent("onstorage", eventFiredStorage, false);
          }
        }
      }
      
      function getExportsFirefox() {
        return {
          addEventListener: addEventListener,
          removeEventListener: removeEventListener,
          fireEvent: fireEventFirefox
        };
      }
      
      function getExportsLocalStorage() {
        return {
          addEventListener: addEventListener,
          removeEventListener: removeEventListener,
          fireEvent: fireEventLocalStorage
        };
      }
      
      function getExportsPlaceholder() {
        function empty() { }
        return {
          addEventListener: empty,
          removeEventListener: empty,
          fireEvent: empty
        };
      }
      
      function getExports() {
        if (firefox) {
          return getExportsFirefox();
        } else if (ytcenter.supported.localStorage) {
          return getExportsLocalStorage();
        } else {
          return getExportsPlaceholder();
        }
      }
      var listeners = {};
      var guid = null;
      var firefox = identifier === 6;
      
      var hasLock = false;
      
      var STORAGE_KEY = "CMS-YTC";
      var STORAGE_LOCK = "CMS-YTC-LOCK";
      var STORAGE_EXPIRED = 3600000;
      var STORAGE_WAIT = 50;
      var STORAGE_TIMEOUT = 1000;
      var STORAGE_CLEAN = 1000;
      
      var cleanThrottle = ytcenter.utils.throttle(clean, STORAGE_CLEAN);
      
      init();
      return getExports();
    })();
    
    ytcenter.channelPlaylistLinks = (function(){
      function update() {
        var page = ytcenter.getPage();
        if (page === "channel") {
          if (!ytcenter.settings.channelUploadedVideosPlaylist) {
            var elements = document.getElementsByTagName("a");
            for (var i = 0, len = elements.length; i < len; i++) {
              var el = elements[i];
              if (el && typeof el.getAttribute === "function") {
                var href = el.getAttribute("href");
                if (href && typeof href.match === "function" && href.match(/^\/watch\?v=[a-zA-Z0-9_\-]+&list=/g) && (ytcenter.utils.hasClass(el, "ux-thumb-wrap") || ytcenter.utils.hasClass(el, "yt-uix-tile-link"))) {
                  el.setAttribute("href", /^(\/watch\?v=[a-zA-Z0-9_\-]+)&list=/g.exec(href)[1]);
                  el.setAttribute("data-ytc-href", href);
                }
              }
            }
          } else {
            var elements = document.getElementsByTagName("a");
            for (var i = 0, len = elements.length; i < len; i++) {
              var el = elements[i];
              if (el && typeof el.getAttribute === "function") {
                var href = el.getAttribute("data-ytc-href");
                if (href) {
                  el.setAttribute("href", href);
                  el.removeAttribute("data-ytc-href");
                }
              }
            }
          }
        }
      }
      
      return {
        update: update
      };
    })();
    
    ytcenter.html5Fix = (function(){
      /* Begin Yonezpt workaround for issue #1083 (#1125) */
      function detour(b, c) {
        return function(){
          // we will call the original sizes, store them in the "changed" variable and
          // check wether it has the width and height properties. If it does then we
          // will change them, if not then we relay whatever other arguments the
          // unknown function calls require
          var changed = b.apply(this, arguments);
          if (changed.width && changed.height && ytcenter.getPage() === "watch") {
            // the variable "c" is just a way to distinguish between sizes for the video canvas
            // and sizes for the progressbar, and its components
            // TODO Try using clientWidth or the likes instead of bounding client rect as i.e. clientWidth is better supported.
            
            var movie_player = document.getElementById("movie_player");
            var html5_container = document.getElementsByClassName("html5-video-container");
            
            var rect = null;
            if (c && movie_player) {
              rect = movie_player.getBoundingClientRect();
            } else if (html5_container && html5_container.length > 0 && html5_container[0]) {
              rect = html5_container[0].getBoundingClientRect();
            }
            
            changed.width = rect.width;
            changed.height = rect.height;
          }
          return changed;
        };
      }
      
      function patchDetour() {
        var i, j;
        try {
          // first of all we will find our main pointer that targets the two functions we want
          // to intercept and for that we will iterate through all the keys in the player instance
          // object (which is acquired by attaching a variable to the Application.create function
          // which you -YePpHa- already know), find our target functions and "patch" them
          // accordingly
          for (i in playerInstance) {
            // first filtering step is to only work with keys that are objects, aren't null objects
            // and contain the .element key - there is only one object that contains it which
            // is the one that we want
            if (typeof playerInstance[i] === 'object' && playerInstance[i] && playerInstance[i].element) {
              con.log('Pointer: ' + i);
              // now that we have our main pointer we will iterate through all its keys
              // to find our target functions
              for (j in playerInstance[i]) {
                // here we check for the main properties of the functions that we want to
                // find and for that we will check for certain details inside the functions
                // that we are currently iterating. never use properties that can be changed
                // when the script is minified -such as named functions- instead use
                // native javascript nomenclature which is less likely to change.
                // in this case both our functions contain the return"detailpage" text
                // so we will be looking for that line in each function.
                // we also only want to look for functions, the rest will only be a waste of time
                if (typeof playerInstance[i][j] === 'function' && /"detailpage"!=/.test(playerInstance[i][j].toString())) {
                  // now that we find one of the two functions we will check which one
                  // we detect so we can manipulate it accordingly.
                  // there are two functions: one relays the dimensions to the progressbar
                  // elements and the other is for the video element size. 
                  // they are almost identical, but there are small differences which
                  // we wil use to detect which one is for the progressbar and video,
                  // the later ends with !0) while the former doesn't, so we will use
                  // that information to regulate the functions' manipulation
                  if (/!0\)/.test(playerInstance[i][j].toString())) {
                    con.log('Progressbar: ' + j);
                    // here we simply wrap the original function to force it pass
                    // through our detour function before returning the size values.
                    // in this case I add a '' so that the detour function can tell which
                    // function is being called and change the sizes accordingly
                    playerInstance[i][j] = detour(playerInstance[i][j], '');
                  } else if (!/!0\)/.test(playerInstance[i][j].toString())) {
                    con.log('Canvas: ' + j);
                    playerInstance[i][j] = detour(playerInstance[i][j]);
                  }
                }
              }
            }
          }
        } catch (e) {
          con.error(e);
        }
      }
      
      function isNewPlayer() {
        return (ytcenter.player.config && ytcenter.player.config.assets && ytcenter.player.config.assets.js && ytcenter.player.config.assets.js.indexOf("//s.ytimg.com/yts/jsbin/html5player-new-") === 0);
      }
      
      function fixPlayerSize() {
        /*if (isNewPlayer()) {*/
          window.matchMedia = null;
        /*} else {
          patchDetour();
        }*/
      }
      
      /* End Yonezpt glorious workaround */
      
      function load() {
        if (!loadCalled) {
          loadCalled = true;
          playerAPI && playerAPI.setAttribute("id", "player-api");
          
          con.log("ytplayer.load() has been called.");
          playerInstance = uw.yt.player.Application.create("player-api", uw.ytplayer.config);
          uw.myPlayerInstance = playerInstance;
        }
        
        !createWrapped && fixPlayerSize();
        
        uw.ytplayer.config.loaded = true;
      }
      
      function playerLoadInjector() {
        function getter() {
          return load;
        }
        function setter(value) {
          if (!loadCalled && ytcenter.html5 && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream()) {
            playerAPI = document.getElementById("player-api");
            playerAPI.setAttribute("id", "player-api-disabled");
          }
        }
        function addProp(noTimer) {
          // We need to wrap yt.player.Application.create to be able to support SPF properly. However, a better method might be found.
          if (uw.yt) {
            if (propAdded) return;
            propAdded = true;
            addPropertyWrapper(uw.yt, "player.Application.create", function(instance){
              playerInstance = instance;
              uw.myPlayerInstance = playerInstance;
              fixPlayerSize();
            }, function(){
              createWrapped = true;
            });
          } else {
            !noTimer && !stopProp && setTimeout(addProp, 100);
          }
        }
        var propAdded = false;
        var stopProp = false;
        addProp();
        
        ytcenter.playerInstance.setProperty("load", setter, getter);
        
        ytcenter.pageReadinessListener.addEventListener("bodyComplete", function(){
          stopProp = true;
        });
        
        ytcenter.pageReadinessListener.addEventListener("bodyInteractive", function(){
          addProp(true);
          if (ytcenter.html5 && !(uw.yt && uw.yt.player && uw.yt.player.Application && uw.yt.player.Application.create)) {
            ytcenter.insertScript(uw.ytplayer.config.assets.js, "html5player/html5player").onload(ytplayer.load);
            ytcenter.insertStyle(uw.ytplayer.config.assets.css, "www-player");
          }
        });
      }
      
      var playerInstance = null;
      var playerAPI = null;
      var createWrapped = false;
      
      var loadCalled = false;
      
      // Always run this
      playerLoadInjector();
      
      var exports = {};
      exports.load = load;
      
      return exports;
    })();

    /*> utils.js */

    ytcenter.getMutationObserver = function(){
      var a;
      try {
        a = MutationObserver || uw.MutationObserver || WebKitMutationObserver || uw.WebKitMutationObserver || MozMutationObserver || uw.MozMutationObserver;
      } catch (e) {
        try {
          a = uw.MutationObserver || WebKitMutationObserver || uw.WebKitMutationObserver || MozMutationObserver || uw.MozMutationObserver;
        } catch (e) {
          try {
            a = WebKitMutationObserver || uw.WebKitMutationObserver || MozMutationObserver || uw.MozMutationObserver;
          } catch (e) {
            try {
              a = uw.WebKitMutationObserver || MozMutationObserver || uw.MozMutationObserver;
            } catch (e) {
              try {
                a = MozMutationObserver || uw.MozMutationObserver;
              } catch (e) {
                a = uw.MozMutationObserver;
              }
            }
          }
        }
      }
      return a;
    };

    /*> placement_system.js */
    
    ytcenter.descriptionTags = (function(){
      function addTags(list, tags) {
        for (var i = 0, len = tags.length; i < len; i++) {
          var item = document.createElement("li");
          item.textContent = tags[i];
          list.appendChild(item);
        }
      }
      function addSection(title, tags) {
        if (addedSections[title]) {
          addedSections[title].innerHTML = "";
          addTags(addedSections[title], tags);
          return;
        }
        var extras = document.getElementById("watch-description-extras");
        if (extras) {
          var list = extras.getElementsByClassName("watch-extras-section");
          if (list && list[0]) {
            var item = document.createElement("li");
            item.className = "watch-meta-item yt-uix-expander-body";
            
            var titleElement = document.createElement("h4");
            titleElement.className = "title";
            titleElement.textContent = ytcenter.language.getLocale(title);
            ytcenter.events.addEvent("language-refresh", function(){
              titleElement.textContent = ytcenter.language.getLocale(title);
            });
            
            var tagList = document.createElement("ul");
            tagList.className = "content watch-info-tag-list";
            addedSections[title] = tagList;
            
            addTags(tagList, tags);
            
            item.appendChild(titleElement);
            item.appendChild(tagList);
            
            elements.push(item);
            
            list[0].appendChild(item);
          }
        }
      }
      
      function destroy() {
        for (var i = 0, len = elements.length; i < len; i++) {
          var element = elements[i];
          if (element.parentNode && element.parentNode.removeChild) {
            element.parentNode.removeChild(element);
          }
        }
        addedSections = {};
        elements = [];
      }
      
      var addedSections = {};
      var elements = [];
      
      var exports = {};
      
      exports.addSection = addSection;
      exports.destroy = destroy;
      
      return exports;
    })();

    /*> language.js */

    /*> default_settings.js */

    ytcenter.settings = $Clone(ytcenter._settings);
	
    ytcenter.doRepeat = false;
    ytcenter.html5 = false;
    ytcenter.html5flash = false;
    ytcenter.watch7 = true;
    ytcenter.redirect = function(url, newWindow){
      con.log("Redirecting" + (newWindow ? " in new window" : "") + " to " + url);
      if (typeof newWindow != "undefined") {
        window.open(ytcenter.utils.replaceTextAsString(url, {
          title: ytcenter.video.title,
          videoid: ytcenter.video.id,
          author: ytcenter.video.author,
          url: loc.href
        }));
      } else {
        loc.href = ytcenter.utils.replaceTextAsString(url, {
          title: ytcenter.video.title,
          videoid: ytcenter.video.id,
          author: ytcenter.video.author,
          url: loc.href
        });
      }
    };
    
    ytcenter.discardElement = function(element){
      if (element.parentNode && typeof element.parentNode.removeChild === "function") {
        element.parentNode.removeChild(element);
      }
    };
    
    ytcenter.callback_db = [];
    if (identifier === 3) { // Firefox Extension
      self.port.on("xhr onreadystatechange", function(data){
        var data = JSON.parse(data);
        if (ytcenter.callback_db[data.id].onreadystatechange)
          ytcenter.callback_db[data.id].onreadystatechange({responseText: data.responseText});
      });
      self.port.on("xhr onload", function(data){
        var data = JSON.parse(data);
        if (ytcenter.callback_db[data.id].onload)
          ytcenter.callback_db[data.id].onload({responseText: data.responseText});
      });
      self.port.on("xhr onerror", function(data){
        var data = JSON.parse(data);
        if (ytcenter.callback_db[data.id].onerror)
          ytcenter.callback_db[data.id].onerror({responseText: data.responseText});
      });
      self.port.on("load callback", function(data){
        data = JSON.parse(data);
        ytcenter.callback_db[data.id](data.storage);
      });
      self.port.on("save callback", function(data){
        data = JSON.parse(data);
        ytcenter.callback_db[data.id]();
      });
    }
    ytcenter.storageName = "YouTubeCenterSettings";
    ytcenter.loadSettings = function(callback){
      if (preloadedSettings) {
        for (var key in preloadedSettings) {
          if (preloadedSettings.hasOwnProperty(key)) {
            ytcenter.settings[key] = preloadedSettings[key];
          }
        }
        preloadedSettings = undefined;
        callback && callback();
      }
      
      ytcenter.unsafeCall("load", [ytcenter.storageName], function(storage){
        if (storage === "[object Object]") storage = {};
        if (typeof storage === "string")
          storage = JSON.parse(storage);
        for (var key in storage) {
          if (storage.hasOwnProperty(key)) {
            ytcenter.settings[key] = storage[key];
          }
        }
        if (callback) callback();
      });
    };
    ytcenter.__settingsLoaded = false;
    ytcenter.loadSettings(function(){
      ytcenter.__settingsLoaded = true;
      var page = ytcenter.getPage();
      if ((ytcenter.settings.forcePlayerType === "aggressive_flash" && page === "watch") || (ytcenter.settings.embed_forcePlayerType === "aggressive_flash" && page === "embed") || (ytcenter.settings.channel_forcePlayerType === "aggressive_flash" && page === "channel")) {
        // Try to prevent the html5 player from having any effect on the page to increase the load time of the flash player.
        uw.yt = uw.yt || {};
        uw.yt.player = uw.yt.player || {};
        uw.yt.player.Application = uw.yt.player.Application || {};
        uw.yt.player.Application.create = uw.yt.player.Application.create || null;
        freeze(uw, "yt.player.Application.create");
      }
      
      settingsInit();
      if ((ytcenter.getPage() === "embed" && ytcenter.settings.embed_enabled) || ytcenter.getPage() !== "embed") {
        ytcenter.tabEvents.addEventListener("settings", function(settings){
          con.log("[Tab Events] Received updated settings from another tab.");
          var player_wide = ytcenter.settings.player_wide; // We don't want this to be updated.
          ytcenter.settings = JSON.parse(JSON.stringify(settings));
          ytcenter.settings.player_wide = player_wide;
          
          ytcenter.language.update();
          /*ytcenter.events.performEvent("settings-update");
          ytcenter.title.update();
          ytcenter.classManagement.applyClasses();*/
        });
      }
    });
    
    ytcenter.saveSettings = (function(){
      function save(throttle, callback) {
        if (typeof throttle !== "boolean") throttle = true;
        
        ytcenter.events.performEvent("save");
        if (throttle) {
          doingThrottle = true;
          throttleStoreSettings(callback);
        } else {
          storeSettings(callback);
          if (doingThrottle) throttleCancel = true;
        }
      }
      
      function saveComplete(callback) {
        ytcenter.events.performEvent("save-complete");
        
        throttleAnnounceSettingStored(); // This should not be spammed!
        
        var args = Array.prototype.splice.call(arguments, 1, arguments.length);
        if (typeof callback === "function") callback.apply(null, args);
      }
      
      function storeSettings(callback) {
        if (doingThrottle && throttleCancel) {
          doingThrottle = false;
          throttleCancel = false;
          return;
        }

        con.log("[Storage] Checking if settings have expired.");
        ytcenter.unsafeCall("load", [ytcenter.storageName], function(storage){
          if (storage === "[object Object]") storage = {};
          if (typeof storage === "string") storage = JSON.parse(storage);

          if (!storage.lastUpdated || storage.lastUpdated <= ytcenter.settings.lastUpdated) {
            con.log("[Storage] Saving Settings");
            ytcenter.settings.lastUpdated = ytcenter.utils.now();
            ytcenter.unsafeCall("save", [ytcenter.storageName, JSON.stringify(ytcenter.settings)], ytcenter.utils.bind(null, saveComplete, callback));
          } else {
            for (var key in storage) {
              if (storage.hasOwnProperty(key)) {
                ytcenter.settings[key] = storage[key];
              }
            }
          }
        });
      }
      
      function announceSettingStored() {
        con.log("[Tab Events] Sending new settings to other open tabs.");
        ytcenter.tabEvents.fireEvent("settings", ytcenter.settings);
      }

      var throttleCancel = false;
      var doingThrottle = false;
      
      var throttleStoreSettings = ytcenter.utils.throttle(storeSettings, 200);
      var throttleAnnounceSettingStored = ytcenter.utils.throttle(announceSettingStored, 7500);
      
      return save;
    })();
    
    ytcenter.checkForUpdatesDev = (function(){
      var updElement;
      return function(success, error, disabled){
        // We check if this build is a dev build.
        if (!devbuild) {
          con.log("[Update] This is not a dev build!");
          return;
        } else {
          con.log("Checking for updates...");
          if (typeof error == "undefined") {
            error = function(){};
          }
          ytcenter.utils.xhr({
            method: "GET",
            url: "https://raw.github.com/YePpHa/YouTubeCenter/master/devbuild.number",
            ignoreCache: true,
            headers: {
              "Content-Type": "text/plain"
            },
            onload: (function(success){
              return function(response){
                con.log("Got Update Response");
                var buildnumber = -1;
                if (response && response.responseText) {
                  buildnumber = parseInt(/build\.number=([0-9]+)/m.exec(response.responseText)[1], 10);
                  con.log("[Update] Current dev build #" + buildnumber + ". Your build number #" + devnumber);
                } else {
                  con.log("Couldn't parse the build number");
                }
                if (buildnumber > devnumber) {
                  con.log("New update available");
                  if (typeof updElement != "undefined") {
                    ytcenter.discardElement(updElement);
                  }
                  updElement = document.createElement("div");
                  updElement.className = "yt-alert yt-alert-default yt-alert-warn";
                  updElement.style.margin = "0 auto";
                  var ic = document.createElement("div");
                  ic.className = "yt-alert-icon";
                  var icon = document.createElement("img");
                  icon.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
                  icon.className = "icon master-sprite";
                  icon.setAttribute("alt", "Alert icon");
                  ic.appendChild(icon);
                  updElement.appendChild(ic);
                  var c = document.createElement("div");
                  c.className = "yt-alert-buttons";
                  var cbtn = document.createElement("button");
                  cbtn.setAttribute("type", "button");
                  cbtn.setAttribute("role", "button");
                  cbtn.setAttribute("onclick", ";return false;");
                  cbtn.className = "close yt-uix-close yt-uix-button yt-uix-button-close";
                  ytcenter.utils.addEventListener(cbtn, "click", (function(updElement){
                    return function(){
                      ytcenter.utils.addClass(updElement, 'hid');
                    };
                  })(updElement));
                  
                  var cbtnt = document.createElement("span");
                  cbtnt.className = "yt-uix-button-content";
                  cbtnt.textContent = "Close ";
                  cbtn.appendChild(cbtnt);
                  c.appendChild(cbtn);
                  updElement.appendChild(c);
                  
                  var cn = document.createElement("div");
                  cn.className = "yt-alert-content";
                  
                  var cnt = document.createElement("span");
                  cnt.className = "yt-alert-vertical-trick";
                  
                  var cnme = document.createElement("div");
                  cnme.className = "yt-alert-message";
                  var f1 = ytcenter.utils.replaceText(ytcenter.language.getLocale("UPDATER_DEV_NEWBUILD"),
                    {
                      "{lb}": function(){ return document.createElement("br"); },
                      "{url}": function(){
                        var a = document.createElement("a");
                        a.href = "https://github.com/YePpHa/YouTubeCenter/wiki/Developer-Version";
                        a.setAttribute("target", "_blank");
                        a.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("DEV_BUILD"), { "{n}": document.createTextNode(buildnumber) }));
                        return a;
                      }
                    }
                  );
                  ytcenter.events.addEvent("language-refresh", function(){
                    f1 = ytcenter.utils.replaceText(ytcenter.language.getLocale("UPDATER_DEV_NEWBUILD"),
                      {
                        "{lb}": function(){ return document.createElement("br"); },
                        "{url}": function(){
                          var a = document.createElement("a");
                          a.href = "https://github.com/YePpHa/YouTubeCenter/wiki/Developer-Version";
                          a.setAttribute("target", "_blank");
                          a.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("DEV_BUILD"), { "{n}": document.createTextNode(buildnumber) }));
                          return a;
                        }
                      }
                    );
                    cnme.innerHTML = "";
                    cnme.appendChild(f1);
                  });
                  cnme.appendChild(f1);
                  
                  cn.appendChild(cnt);
                  cn.appendChild(cnme);
                  updElement.appendChild(cn);
                  
                  document.getElementById("alerts").appendChild(updElement);
                } else {
                  con.log("No new updates available");
                }
                if (success) {
                  con.log("Calling update callback");
                  success(response);
                }
              };
            })(success),
            onerror: error
          });
        }
      };
    })();
    ytcenter.checkForUpdates = (function(){
      var updElement;
      return function(success, error, disabled){
        if (devbuild) {
          con.log("[Update] This is a dev build.");
          ytcenter.checkForUpdatesDev(success, error, disabled); // This is only called when it's a developer build.
          return;
        }
        // If it's the Chrome/Opera addon and the browser is Opera, or if it's the Firefox addon it will not check for updates!
        if ((identifier === 1 && (uw.navigator.userAgent.indexOf("Opera") !== -1 || uw.navigator.userAgent.indexOf("OPR/") !== -1)) || identifier === 6 || identifier === 8) {
          con.log("[UpdateChecker] UpdateChecker has been disabled!");
          if (typeof disabled == "function")
            disabled();
        } else {
          con.log("Checking for updates...");
          if (typeof error == "undefined") {
            error = function(){};
          }
          ytcenter.utils.xhr({
            method: "GET",
            url: "https://yeppha.github.io/downloads/YouTubeCenter.meta.js",
            headers: {
              "Content-Type": "text/plain"
            },
            onload: (function(success){
              return function(response){
                con.log("Got Update Response");
                var rev = -1,
                    ver = "-1"
                if (response && response.responseText) {
                  rev =  parseInt(/^\/\/ @updateVersion\s+([0-9]+)$/m.exec(response.responseText)[1], 10);
                  ver = /^\/\/ @version\s+([a-zA-Z0-9.,-_]+)$/m.exec(response.responseText)[1];
                } else {
                  con.log("Couldn't parse revision and version from the update page.");
                }
                if (rev > ytcenter.revision) {
                  con.log("New update available");
                  if (typeof updElement != "undefined") {
                    ytcenter.discardElement(updElement);
                  }
                  updElement = document.createElement("div");
                  updElement.className = "yt-alert yt-alert-default yt-alert-warn";
                  updElement.style.margin = "0 auto";
                  var ic = document.createElement("div");
                  ic.className = "yt-alert-icon";
                  var icon = document.createElement("img");
                  icon.src = "//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif";
                  icon.className = "icon master-sprite";
                  icon.setAttribute("alt", "Alert icon");
                  ic.appendChild(icon);
                  updElement.appendChild(ic);
                  var c = document.createElement("div");
                  c.className = "yt-alert-buttons";
                  var cbtn = document.createElement("button");
                  cbtn.setAttribute("type", "button");
                  cbtn.setAttribute("role", "button");
                  cbtn.setAttribute("onclick", ";return false;");
                  cbtn.className = "close yt-uix-close yt-uix-button yt-uix-button-close";
                  ytcenter.utils.addEventListener(cbtn, "click", (function(updElement){
                    return function(){
                      ytcenter.utils.addClass(updElement, 'hid');
                    };
                  })(updElement));
                  
                  var cbtnt = document.createElement("span");
                  cbtnt.className = "yt-uix-button-content";
                  cbtnt.textContent = "Close ";
                  cbtn.appendChild(cbtnt);
                  c.appendChild(cbtn);
                  updElement.appendChild(c);
                  
                  var cn = document.createElement("div");
                  cn.className = "yt-alert-content";
                  
                  var cnt = document.createElement("span");
                  cnt.className = "yt-alert-vertical-trick";
                  
                  var cnme = document.createElement("div");
                  cnme.className = "yt-alert-message";
                  var f1 = document.createTextNode(ytcenter.language.getLocale("UPDATE_NOTICE"));
                  ytcenter.language.addLocaleElement(f1, "UPDATE_NOTICE", "@textContent", {});
                  var f2 = document.createElement("br");
                  var f3 = document.createTextNode(ytcenter.language.getLocale("UPDATE_INSTALL"));
                  ytcenter.language.addLocaleElement(f3, "UPDATE_INSTALL", "@textContent", {});
                  var f4 = document.createTextNode(" ");
                  var f5 = document.createElement("a");
                  if (identifier === 0) {
                    f5.href = "https://yeppha.github.io/downloads/YouTubeCenter.user.js";
                  } else if (identifier === 1) {
                    f5.href = "https://yeppha.github.io/downloads/YouTubeCenter.crx";
                  } else if (identifier === 2) {
                    f5.href = "https://yeppha.github.io/downloads/YouTubeCenter.mxaddon";
                  } else if (identifier === 3) {
                    f5.href = "https://yeppha.github.io/downloads/YouTubeCenter.xpi";
                  } else if (identifier === 4) {
                    f5.href = "https://yeppha.github.io/downloads/YouTubeCenter.safariextz";
                  } else if (identifier === 5) {
                    f5.href = "https://yeppha.github.io/downloads/YouTubeCenter.oex";
                  }
                  f5.setAttribute("target", "_blank");
                  f5.textContent = "@name@ v" + ver;
                  var f6 = document.createTextNode(" ");
                  var f7 = document.createTextNode(ytcenter.language.getLocale("UPDATE_OR"));
                  ytcenter.language.addLocaleElement(f7, "UPDATE_OR", "@textContent", {});
                  var f8 = document.createTextNode(" ");
                  var f9 = document.createElement("a");
                  f9.setAttribute("target", "_blank");
                  if (identifier === 6) {
                    f9.href = "https://addons.mozilla.org/en-us/firefox/addon/youtube-center/";
                    f9.textContent = "addons.mozilla.org";
                  } else {
                    f9.href = "https://github.com/YePpHa/YouTubeCenter/wiki";
                    f9.textContent = "github.com/YePpHa/YouTubeCenter/";
                  }
                  
                  cnme.appendChild(f1);
                  cnme.appendChild(f2);
                  cnme.appendChild(f3);
                  cnme.appendChild(f4);
                  cnme.appendChild(f5);
                  cnme.appendChild(f6);
                  cnme.appendChild(f7);
                  cnme.appendChild(f8);
                  cnme.appendChild(f9);
                  
                  cn.appendChild(cnt);
                  cn.appendChild(cnme);
                  updElement.appendChild(cn);
                  
                  document.getElementById("alerts").appendChild(updElement);
                } else {
                  con.log("No new updates available");
                }
                if (success) {
                  con.log("Calling update callback");
                  success(response);
                }
              };
            })(success),
            onerror: error
          });
        }
      };
    })();
    
    ytcenter.mp3services = [
      {
        label: 'SETTINGS_MP3SERVICES_PEGGO',
        value: 'http://peggo.co/dvr/{videoid}'
      }, {
        label: 'SETTINGS_MP3SERVICES_VIDEO2MP3',
        value: 'http://www.video2mp3.net/index.php?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&hq=0'
      }, {
        label: 'SETTINGS_MP3SERVICES_VIDEO2MP3_HQ',
        value: 'http://www.video2mp3.net/index.php?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&hq=1'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEINMP3_64',
        value: 'http://www.youtubeinmp3.com/download.php?youtubeURL=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&quality=64&submit=Download+MP3'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEINMP3_128',
        value: 'http://www.youtubeinmp3.com/download.php?youtubeURL=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&quality=128&submit=Download+MP3'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEINMP3_320',
        value: 'http://www.youtubeinmp3.com/download.php?youtubeURL=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&quality=320&submit=Download+MP3'
      }, {
        label: 'SETTINGS_MP3SERVICES_HDDOWNLOADER_128',
        value: 'http://www.hddownloader.com/index.php?act=do&url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&dldtype=128&outFormat=mp3'
      }, {
        label: 'SETTINGS_MP3SERVICES_HDDOWNLOADER_192',
        value: 'http://www.hddownloader.com/index.php?act=do&url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&dldtype=192&outFormat=mp3'
      }, {
        label: 'SETTINGS_MP3SERVICES_HDDOWNLOADER_256',
        value: 'http://www.hddownloader.com/index.php?act=do&url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}&dldtype=256&outFormat=mp3'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEMP3PRO',
        value: 'http://www.youtubemp3pro.com/convert/https://www.youtube.com/watch?v={videoid}'
      }, {
        label: 'SETTINGS_MP3SERVICES_YOUTUBEMP3',
        value: 'http://www.youtube-mp3.org/#v={videoid}'
      }, {
        label: 'SETTINGS_MP3SERVICES_SNIPMP3',
        value: 'http://snipmp3.com/?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}'
      }, {
        label: 'SETTINGS_MP3SERVICES_CLIPCONVERTER',
        value: 'http://www.clipconverter.cc/?url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D{videoid}'
      }
    ];


    /*> settings_panel.js */
    /*> settings_init.js */

    settingsInit();

    /*> video.js */
    
    ytcenter.site = {};
    ytcenter.site.removeAdvertisement = function(cfg){
      cfg = cfg || ytcenter.player.getConfig();
      var _ads = [
        "supported_without_ads",
        "ad3_module",
        "adsense_video_doc_id",
        "allowed_ads",
        "baseUrl",
        "cafe_experiment_id",
        "afv_inslate_ad_tag",
        "advideo",
        "ad_device",
        "ad_channel_code_instream",
        "ad_channel_code_overlay",
        "ad_eurl",
        "ad_flags",
        "ad_host",
        "ad_host_tier",
        "ad_logging_flag",
        "ad_preroll",
        "ad_slots",
        "ad_tag",
        "ad_video_pub_id",
        "aftv",
        "afv",
        "afv_ad_tag",
        "afv_instream_max",
        "afv_ad_tag_restricted_to_instream",
        "afv_video_min_cpm",
        "dynamic_allocation_ad_tag",
        "pyv_ad_channels",
        "max_dynamic_allocation_ad_tag_length",
        "midroll_freqcap",
        "invideo",
        "instream",
        "pyv_in_related_cafe_experiment_id"
      ];
      for (var i = 0; i < _ads.length; i++) {
        try {
          delete cfg.args[_ads[i]];
        } catch (e) {
          con.error(e);
        }
      }
      try {
        if (cfg.args.csi_page_type) {
          con.log("Chaning csi_page_type from " + cfg.args.csi_page_type + " to watch, watch7");
          if (ytcenter.watch7) {
            if (ytcenter.html5) {
              cfg.args.csi_page_type = "watch, watch7_html5";
            } else {
              cfg.args.csi_page_type = "watch, watch7";
            }
          } else {
            cfg.args.csi_page_type = "watch";
          }
        }
      } catch (e) {
        con.error(e);
      }
      try {
        if (document.getElementById("watch-channel-brand-div")) {
          ytcenter.discardElement(document.getElementById("watch-channel-brand-div"));
        }
      } catch (e) {
        con.error(e);
      }
      try {
        var adBadges = ytcenter.utils.toArray(document.getElementsByClassName("yt-badge-ad"));
        for (var i = 0, len = adBadges.length; i < len; i++) {
          var parent = adBadges;
          while (parent && parent.parentNode && (parent = parent.parentNode) !== null) {
            if (parent && parent.tagName === "LI") {
              parent.parentNode.removeChild(parent);
              break;
            }
          }
        }
      } catch (e) {
        con.error(e);
      }
      return cfg;
    };
    ytcenter.user = {};
    ytcenter.user.callChannelFeed = function(username, callback){
      ytcenter.utils.xhr({
        method: "GET",
        url: 'https://gdata.youtube.com/feeds/api/channels?q=' + encodeURIComponent("\"" + username + "\"") + '&start-index=1&max-results=1&v=2&alt=json',
        headers: {
          "Content-Type": "text/plain"
        },
        onload: function(response){
          if (response.responseText) {
            var j = JSON.parse(response.responseText);
            if (j.feed && j.feed.entry && j.feed.entry.length > 0) {
              callback.apply(j.feed.entry[0]);
            }
          }
        }
      });
    };
    
    ytcenter.gridview = (function(){
      function getFeed() {
        return document.getElementById("feed") || document.getElementById("browse-items-primary");
      }
      function getIndividualFeed(feed) {
        if (feed && feed.children && feed.children.length > 0 && feed.children[0]) {
          return feed.children[0];
        }
        return null;
      }
      function getFeedName(feed) {
        var individualFeed = getIndividualFeed(feed);
        if (individualFeed && individualFeed.getAttribute) {
          return individualFeed.getAttribute("data-feed-name");
        }
        return null;
      }
      function getFeedType(feed) {
        var individualFeed = getIndividualFeed(feed),
          type = null;
        if (individualFeed && individualFeed.getAttribute) {
          type = individualFeed.getAttribute("data-feed-type");
        }
        return type;
      }
      function getFeedItems(feed) {
        var items = [];
        if (feed && feed.getElementsByClassName) {
          var feedContainer = feed.getElementsByClassName("feed-item-container");
          
          for (var i = 0, len = feedContainer.length; i < len; i++) {
            items.push(parseFeedItem(feedContainer[i]));
          }
        }
        return items;
      }
      function parseFeedItem(item) {
        var details = {},
          aElm = item.getElementsByTagName("a");
        if (aElm && aElm[0] && aElm[0].getAttribute) {
          var images = aElm[0].getElementsByTagName("img");
          details.channelURL = aElm[0].getAttribute("href");
          
          if (images && images.length > 0 && images[0] && images[0].getAttribute) {
            details.channelName = images[0].getAttribute("alt");
          }
        } else {
          details.channelURL = null;
          details.channelName = null;
        }
        
        details.wrapper = item;
        details.metadata = item.getElementsByClassName("yt-lockup-meta")[0];
        
        details.channelVerified = (item.getElementsByClassName("yt-user-name-icon-verified").length > 0);
        details.bubbleContainer = item.getElementsByClassName("feed-author-bubble-container")[0];
        details.bubbleElement = item.getElementsByClassName("feed-author-bubble")[0];
        
        if (item.getElementsByClassName("yt-user-name").length > 0) {
          details.usernameElement = item.getElementsByClassName("yt-user-name")[0];
          details.ownerElement = details.usernameElement.parentNode;
          details.ownerElementListItem = (details.ownerElement.tagName === "LI");
          details.usernamePrefixNode = null;
          if (details.usernameElement.previousSibling && details.usernameElement.previousSibling.nodeType === 3) {
            details.usernamePrefixNode = details.usernameElement.previousSibling;
          }
        } else {
          details.usernameElement = null;
          details.ownerElement = null;
          details.usernamePrefixNode = null;
        }
        
        return details;
      }
      function createOwnerElement(details) {
        var b = details.bubbleElement.cloneNode(false);
        b.textContent = details.channelName;
        b.className = b.className.replace("feed-author-bubble", "");
        
        return b;
      }
      function isEnabled(feed) {
        feed = feed || getFeed();
        return (loc.pathname.indexOf("/feed/subscriptions") === 0 && ytcenter.settings.gridSubscriptionsPage) || (getFeedType(feed) === "collection" && ytcenter.settings.gridCollectionPage);
      }
      function delayedUpdate() {
        con.log("[GridView] delayedUpdate called...");
        if (loc.pathname.indexOf("/feed/") === 0) {
          var feed = getFeed(),
          observer = ytcenter.mutation.observe(feed, { childList: true, subtree: true }, function(){
            con.log("[GridView] Mutation Observed... disconnecting!");
            update();
            observer.disconnect();
          });
        }
      }
      function update() {
        if (loc.pathname.indexOf("/feed/") === 0) {
          var feed = getFeed();
          
          if (isEnabled(feed)) {
            var items = getFeedItems(feed);
            var ownerElm = null;
            var ownerWrapper = null;
            var details = null;
            
            for (var i = 0; i < items.length; i++) {
              details = items[i];
              if (!ytcenter.utils.inArray(feedItems, details.wrapper)) {
                feedItems.push(details.wrapper);
                
                var lockupContent = details.metadata.parentNode;
                if ((ownerWrapper = lockupContent.getElementsByClassName("yt-lockup-byline").length) === 0) {
                  if (details.ownerElement) {
                    ownerElm = details.ownerElement.cloneNode(true);
                    if (details.ownerElementListItem) {
                      details.ownerElement.parentNode.removeChild(details.ownerElement);
                    }
                    if (details.usernamePrefixNode) {
                      ownerElm.removeChild(ownerElm.firstChild);
                    }
                  } else {
                    ownerElm = createOwnerElement(items[i]);
                  }
                  ownerWrapper = document.createElement("div");
                  ownerWrapper.className = "ytcenter-grid-subscriptions-username";
                  var ownerElmChildren = null;
                  if (details.ownerElementListItem) {
                    var frag = document.createDocumentFragment();
                    ownerElmChildren = ytcenter.utils.toArray(ownerElm.children);
                    
                    var j;
                    for (j = 0; j < ownerElmChildren.length; j++) {
                      frag.appendChild(ownerElmChildren[j]);
                    }
                    
                    ownerElm = frag;
                  }
                  ownerWrapper.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("SUBSCRIPTIONSGRID_BY_USERNAME"), {"{username}": ownerElm}));
                  ytcenter.events.addEvent("language-refresh", (function(oW, oE, oEC){
                    return function(){
                      if (oEC) {
                        var frag = document.createDocumentFragment();
                        var j;
                        for (j = 0; j < oEC.length; j++) {
                          frag.appendChild(oEC[j]);
                        }
                        oE = frag;
                      }
                      oW.innerHTML = "";
                      oW.appendChild(ytcenter.utils.replaceText(ytcenter.language.getLocale("SUBSCRIPTIONSGRID_BY_USERNAME"), {"{username}": oE}));
                    };
                  })(ownerWrapper, ownerElm, ownerElmChildren));
                  
                  details.ownerWrapper = ownerWrapper;
                  details.metadata.parentNode.insertBefore(ownerWrapper, details.metadata);
                } else {
                  details.ownerWrapper = ownerWrapper;
                }
              }
            }
          }
        }
      }
      var feedItems = [];
        
      return {
        update: update,
        delayedUpdate: delayedUpdate,
        isEnabled: isEnabled
      };
    })();
    
    ytcenter.playlistAutoPlay = (function(){
      /* We want the toggle button */
      function getToggleAutoPlayButton() {
        var playlist = document.getElementById("watch-appbar-playlist");
        if (playlist) {
          var playlistToggleButton = playlist.getElementsByClassName("toggle-autoplay");
          if (playlistToggleButton && playlistToggleButton.length > 0 && playlistToggleButton[0]) {
            playlistToggleButton = playlistToggleButton[0];
          } else {
            playlistToggleButton = null;
          }
          return playlistToggleButton;
        }
        return null;
      }
      
      function setInitialAutoPlayState(state) {
        var playlist = document.getElementById("watch-appbar-playlist");
        if (playlist) {
          var content = playlist.getElementsByClassName("playlist-header-content");
          if (content.length > 0 && content[0]) {
            content[0].setAttribute("data-initial-autoplay-state", (state ? "true" : "false"));
            content[0].setAttribute("initial-autoplay-state", (state ? "true" : "false"));
          }
        }
        toggled = state;
      }
      
      function onToggleButtonClick() {
        toggled = !toggled;
        if (ytcenter.settings.playlistAutoPlayFreeze) return;
        
        ytcenter.settings.playlistAutoPlay = toggled;
        
        ytcenter.saveSettings();
        ytcenter.events.performEvent("settings-update");
      }
      
      function init() {
        if (ytcenter.playlist) {
          setInitialAutoPlayState(ytcenter.settings.playlistAutoPlay);
          var toggleButton = getToggleAutoPlayButton();
          if (toggleButton) {
            ytcenter.utils.addEventListener(toggleButton, "click", onToggleButtonClick, false);
          }
          initState();
          initAutoPlayManipulation();
        }
        
      }
      
      function initState() {
        var playlist = document.getElementById("watch-appbar-playlist");
        
        if (playlist) {
          var toggleAutoplayButton = getToggleAutoPlayButton();
          
          if (toggleAutoplayButton) {
            if (toggled) {
              ytcenter.utils.addClass(toggleAutoplayButton, "yt-uix-button-toggled");
            } else {
              ytcenter.utils.removeClass(toggleAutoplayButton, "yt-uix-button-toggled");
            }
            toggleAutoplayButton.setAttribute("data-button-toggle", (toggled ? "true" : "false"));
          } else {
            toggleAutoplayButton = document.createElement("button");
            toggleAutoplayButton.className = "yt-uix-button yt-uix-button-size-default yt-uix-button-player-controls yt-uix-button-empty yt-uix-button-has-icon toggle-autoplay yt-uix-button-opacity yt-uix-tooltip yt-uix-tooltip" + (toggled ? " yt-uix-button-toggled" : "");
            toggleAutoplayButton.setAttribute("type", "button");
            toggleAutoplayButton.setAttribute("onclick", ";return false;");
            toggleAutoplayButton.setAttribute("title", ytcenter.language.getLocale("PLAYLIST_AUTOPLAY"));
            toggleAutoplayButton.setAttribute("data-button-toggle", (toggled ? "true" : "false"));
            toggleAutoplayButton.addEventListener("click", onToggleButtonClick, false);
            
            var iconWrapper = document.createElement("span");
            iconWrapper.className = "yt-uix-button-icon-wrapper";
            
            var icon = document.createElement("img");
            icon.className = "yt-uix-button-icon yt-uix-button-icon-watch-appbar-autoplay yt-sprite";
            icon.setAttribute("src", "//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif");
            icon.setAttribute("title", ytcenter.language.getLocale("PLAYLIST_AUTOPLAY"));

            // Attach this part to an unload event.
            ytcenter.events.addEvent("ui-refresh", function(){
              icon.setAttribute("title", ytcenter.language.getLocale("PLAYLIST_AUTOPLAY"));
              toggleAutoplayButton.setAttribute("title", ytcenter.language.getLocale("PLAYLIST_AUTOPLAY"));
            }).setFlag("unload");
            
            iconWrapper.appendChild(icon);
            
            toggleAutoplayButton.appendChild(iconWrapper);
            
            var controls = playlist.getElementsByClassName("playlist-nav-controls");
            if (controls && controls[0]) {
              controls = controls[0];
              controls.appendChild(toggleAutoplayButton);
              
              controls.parentNode.style.display = "block";
            }
            
            var controlBar = document.getElementsByClassName("control-bar");
            if (controlBar && controlBar[0]) {
              controlBar = controlBar[0];
              var controls = controlBar.getElementsByClassName("playlist-behavior-controls");
              if (controls && controls[0]) {
                controls = controls[0];
                controls.style.display = "none";
              }
            }
          }
          
          /*if (uw.yt && uw.yt.www && uw.yt.www.watch && uw.yt.www.watch.lists && uw.yt.www.watch.lists.getState) {
            if (uw.yt.www.watch.lists.getState !== getState) {
              getStateFunction = uw.yt.www.watch.lists.getState;
              uw.yt.www.watch.lists.getState = getState;
            }
          } else {
            con.log("[Playlist] getState not found!");
            setTimeout(initState, 2500);
          }*/
        }
      }

      /**
       * Initialize @Yonezpt's method to intercept auto-play navigation.
       * @source http://openuserjs.org/scripts/ParticleCore/Playlist_Autoplay_Control_for_YouTube
       */
      function initAutoPlayManipulation() {
        var www = window._yt_www;
        if (www) {
          for (var key in www) {
            if (www.hasOwnProperty(key)) {
              var prop = www[key];
              if (typeof prop === 'function' && ('' + prop).indexOf('window.spf.navigate') !== -1) {
                www[key] = autoPlayManipulationWrapper(prop);
              }
            }
          }
        }
      }

      /**
       * Wrapper for the navigate function. It will check if auto-play is toggled
       * and prevent calling of original fn.
       * @param {Function} fn The original function.
       * @return {Function} Returns a wrapper.
       */
      function autoPlayManipulationWrapper(fn) {
        return function() {
          var args = arguments;
          if (!args[1] || toggled || (!toggled && args[1].feature && args[1].feature !== 'autoplay')) {
            fn.apply(this, arguments);
          }
        }
      }
      
      function getState() {
        var state = getStateFunction();
        state.autoPlay = toggled;
        
        return state;
      }
      
      var getStateFunction = null;
      
      var timer = null;
      var toggled = false;
      
      return {
        init: init
      };
    })();
    
    ytcenter.likedislikeButtons = (function(){
      function update() {
        if (ytcenter.settings.likedislikeUIEnabled) {
          // Image tint
          updateButtonTint();
          
          // Opacity
          updateButtonContentOpacity();
        } else {
          unload(); // Make sure that the classes are deleted.
        }
      }
      
      function updateLikeButtonOpacity() {
        var opacity = ytcenter.settings.likeButtonOpacity;
        var opacityHover = ytcenter.settings.likeButtonHoverOpacity;
        var filter = "none";
        var filterHover = "none";
        
        if (opacity < 100 && opacity >= 0) {
          filter = "alpha(opacity=" + opacity + ")";
        }
        if (opacityHover < 100 && opacityHover >= 0) {
          filterHover = "alpha(opacity=" + opacityHover + ")";
        }
        ytcenter.utils.setCustomCSS("ytcenter-likebutton-opacity", ".like-button-renderer-like-button-unclicked { opacity: " + (opacity/100) + "; filter: " + filter + "; }");
        ytcenter.utils.setCustomCSS("ytcenter-likebutton-hover-opacity", ".like-button-renderer-like-button-unclicked:hover { opacity: " + (opacityHover/100) + "; filter: " + filterHover + "; }");
      }
      
      function updateLikedButtonOpacity() {
        var opacity = ytcenter.settings.likedButtonOpacity;
        var opacityHover = ytcenter.settings.likedButtonHoverOpacity;
        var filter = "none";
        var filterHover = "none";
        
        if (opacity < 100 && opacity >= 0) {
          filter = "alpha(opacity=" + opacity + ")";
        }
        if (opacityHover < 100 && opacityHover >= 0) {
          filterHover = "alpha(opacity=" + opacityHover + ")";
        }
        ytcenter.utils.setCustomCSS("ytcenter-likedbutton-opacity", ".like-button-renderer-like-button-clicked { opacity: " + (opacity/100) + "; filter: " + filter + "; }");
        ytcenter.utils.setCustomCSS("ytcenter-likedbutton-hover-opacity", ".like-button-renderer-like-button-clicked:hover { opacity: " + (opacityHover/100) + "; filter: " + filterHover + "; }");
      }
      
      function updateDislikeButtonOpacity() {
        var opacity = ytcenter.settings.dislikeButtonOpacity;
        var opacityHover = ytcenter.settings.dislikeButtonHoverOpacity;
        var filter = "none";
        var filterHover = "none";
        
        if (opacity < 100 && opacity >= 0) {
          filter = "alpha(opacity=" + opacity + ")";
        }
        if (opacityHover < 100 && opacityHover >= 0) {
          filterHover = "alpha(opacity=" + opacityHover + ")";
        }
        ytcenter.utils.setCustomCSS("ytcenter-dislikebutton-opacity", ".like-button-renderer-dislike-button-unclicked { opacity: " + (opacity/100) + "; filter: " + filter + "; }");
        ytcenter.utils.setCustomCSS("ytcenter-dislikebutton-hover-opacity", ".like-button-renderer-dislike-button-unclicked:hover { opacity: " + (opacityHover/100) + "; filter: " + filterHover + "; }");
      }
      
      function updateDislikedButtonOpacity() {
        var opacity = ytcenter.settings.dislikedButtonOpacity;
        var opacityHover = ytcenter.settings.dislikedButtonHoverOpacity;
        var filter = "none";
        var filterHover = "none";
        
        if (opacity < 100 && opacity >= 0) {
          filter = "alpha(opacity=" + opacity + ")";
        }
        if (opacityHover < 100 && opacityHover >= 0) {
          filterHover = "alpha(opacity=" + opacityHover + ")";
        }
        ytcenter.utils.setCustomCSS("ytcenter-dislikedbutton-opacity", ".like-button-renderer-dislike-button-clicked { opacity: " + (opacity/100) + "; filter: " + filter + "; }");
        ytcenter.utils.setCustomCSS("ytcenter-dislikedbutton-hover-opacity", ".like-button-renderer-dislike-button-clicked:hover { opacity: " + (opacityHover/100) + "; filter: " + filterHover + "; }");
      }
      
      function updateButtonContentOpacity() {
        updateLikeButtonOpacity();
        updateLikedButtonOpacity();
        updateDislikeButtonOpacity();
        updateDislikedButtonOpacity();
      }
      
      function updateButtonTint() {
        updateLikeTint();
        updateDislikeTint();
        updateLikeHoverTint();
        updateDislikeHoverTint();
        
        updateLikedTint();
        updateDislikedTint();
        updateLikedHoverTint();
        updateDislikedHoverTint();
      }
      
      function updateLikeTint() {
        setButtonColor("ytcenter-likebutton-color", ".like-button-renderer-like-button-unclicked", ytcenter.icon.likebuttonicon, ytcenter.settings.likeButtonColor);
      }
      
      function updateDislikeTint() {
        setButtonColor("ytcenter-dislikebutton-color", ".like-button-renderer-dislike-button-unclicked", ytcenter.icon.dislikebuttonicon, ytcenter.settings.dislikeButtonColor);
      }
      
      function updateLikeHoverTint() {
        setButtonColor("ytcenter-likebutton-hover-color", ".like-button-renderer-like-button-unclicked:hover", ytcenter.icon.likebuttonicon, ytcenter.settings.likeButtonHoverColor);
      }
      
      function updateDislikeHoverTint() {
        setButtonColor("ytcenter-dislikebutton-hover-color", ".like-button-renderer-dislike-button-unclicked:hover", ytcenter.icon.dislikebuttonicon, ytcenter.settings.dislikeButtonHoverColor);
      }
      
      function updateLikedTint() {
        setButtonColor("ytcenter-likedbutton-color", ".like-button-renderer-like-button-clicked", ytcenter.icon.likebuttonicon, ytcenter.settings.likedButtonColor);
      }
      
      function updateDislikedTint() {
        setButtonColor("ytcenter-dislikedbutton-color", ".like-button-renderer-dislike-button-clicked", ytcenter.icon.dislikebuttonicon, ytcenter.settings.dislikedButtonColor);
      }
      
      function updateLikedHoverTint() {
        setButtonColor("ytcenter-likedbutton-hover-color", ".like-button-renderer-like-button-clicked:hover", ytcenter.icon.likebuttonicon, ytcenter.settings.likedButtonHoverColor);
      }
      
      function updateDislikedHoverTint() {
        setButtonColor("ytcenter-dislikedbutton-hover-color", ".like-button-renderer-dislike-button-clicked:hover", ytcenter.icon.dislikebuttonicon, ytcenter.settings.dislikedButtonHoverColor);
      }
      
      function setButtonColor(id, rule, icon, color) {
        var rule1 = rule + ":before," + rule + ":after";
        var rule2 = rule + " .yt-uix-button-content { color: "  + color + "!important; }";
        
        var rgb = ytcenter.utils.hexToColor(color);
        ytcenter.utils.tintImage(icon, {
          r: rgb.red,
          g: rgb.green,
          b: rgb.blue,
          a: 1
        }, function(canvas){
          ytcenter.utils.setCustomCSS(id, rule1 + " { background: url(" + canvas.toDataURL("image/png") + ") no-repeat!important; } " + rule2);
        });
      }
      
      function unload() {
        ytcenter.utils.removeCustomCSS("ytcenter-likebutton-color");
        ytcenter.utils.removeCustomCSS("ytcenter-dislikebutton-color");
        ytcenter.utils.removeCustomCSS("ytcenter-likebutton-hover-color");
        ytcenter.utils.removeCustomCSS("ytcenter-dislikebutton-hover-color");
        ytcenter.utils.removeCustomCSS("ytcenter-likedbutton-color");
        ytcenter.utils.removeCustomCSS("ytcenter-dislikedbutton-color");
        ytcenter.utils.removeCustomCSS("ytcenter-likedbutton-hover-color");
        ytcenter.utils.removeCustomCSS("ytcenter-dislikedbutton-hover-color");
        ytcenter.utils.removeCustomCSS("ytcenter-likebutton-opacity");
        ytcenter.utils.removeCustomCSS("ytcenter-likebutton-hover-opacity");
        ytcenter.utils.removeCustomCSS("ytcenter-dislikebutton-opacity");
        ytcenter.utils.removeCustomCSS("ytcenter-dislikebutton-hover-opacity");
        ytcenter.utils.removeCustomCSS("ytcenter-likedbutton-opacity");
        ytcenter.utils.removeCustomCSS("ytcenter-likedbutton-hover-opacity");
        ytcenter.utils.removeCustomCSS("ytcenter-dislikedbutton-opacity");
        ytcenter.utils.removeCustomCSS("ytcenter-dislikedbutton-hover-opacity");
      }
      
      var exports = {};
      exports.update = update;
      
      exports.updateLikeTint = updateLikeTint;
      exports.updateDislikeTint = updateDislikeTint;
      exports.updateLikeHoverTint = updateLikeHoverTint;
      exports.updateDislikeHoverTint = updateDislikeHoverTint;
      exports.updateLikedTint = updateLikedTint;
      exports.updateDislikedTint = updateDislikedTint;
      exports.updateLikedHoverTint = updateLikedHoverTint;
      exports.updateDislikeHoverTint = updateDislikeHoverTint;
      
      exports.updateLikeButtonOpacity = updateLikeButtonOpacity;
      exports.updateLikedButtonOpacity = updateLikedButtonOpacity;
      exports.updateDislikeButtonOpacity = updateDislikeButtonOpacity;
      exports.updateDislikedButtonOpacity = updateDislikedButtonOpacity;
      
      return exports;
    })();
    
    ytcenter.sparkbar = (function(){
      function update() {
        var wvi = document.getElementById("watch7-views-info"),
            sl = document.getElementsByClassName("video-extras-sparkbar-likes"),
            sd = document.getElementsByClassName("video-extras-sparkbar-dislikes");
        if (sl && sd && sl.length > 0 && sd.length > 0 && sl[0] && sd[0]) {
          if (ytcenter.settings.sparkbarEnabled) {
            sl[0].style.background = ytcenter.settings.sparkbarLikesColor;
            sl[0].style.height = ytcenter.settings.sparkbarHeight + "px";
            sd[0].style.background = ytcenter.settings.sparkbarDislikesColor;
            sd[0].style.height = ytcenter.settings.sparkbarHeight + "px";
            
            sd[0].parentNode.style.height = ytcenter.settings.sparkbarHeight + "px";
          } else {
            sl[0].style.background = "";
            sl[0].style.height = "";
            sd[0].style.background = "";
            sd[0].style.height = "";
            
            sd[0].parentNode.style.height = "";
          }
        }
      }
      var exports = {};
      
      exports.update = update;
      
      return exports;
    })();

    ytcenter.searchRowLimit = (function(){
      function update() {
        if (ytcenter.getPage() === 'search') {
          var resultsElement = document.getElementById("results");
          if (ytcenter.settings.limitSearchRowWidthEnabled) {
            resultsElement.style.width = ytcenter.settings.limitSearchRowWidth + 'px';
          } else {
            resultsElement.style.width = "";
          }
        }
      }

      var exports = {};
      exports.update = update;

      return exports;
    })();

    ytcenter.hideHeaderWhenPlayerPlaying = (function(){
      function init() {
        ytcenter.player.listeners.addEventListener("onStateChange", _update);

        updateEventListeners();
        update();
        updateTransitionTime();
        updateTransition();
      }

      function onFocus(e) {
        e = e || window.event;
        var target = e.target;
        //if (target && target.tagName === "BUTTON") return;

        var _focusTriggered = focusTriggered;
        focusTriggered = true;
        if (focusTriggered !== _focusTriggered) {
          update();
        }
      }

      function onBlur(e) {
        e = e || window.event;
        var target = e.target;
        //if (target && target.tagName === "BUTTON") return;

        var _focusTriggered = focusTriggered;
        focusTriggered = false;
        if (focusTriggered !== _focusTriggered) {
          update();
        }
      }

      function onMouseMove(e) {
        if (!ytcenter.settings.hideHeaderWhenPlayerPlaying) return;

        e = e || window.event;
        var threshold = ytcenter.settings.hideHeaderWhenPlayerPlayingMouseThreshold || 90;

        mouseLeaveTimeout !== null && clearTimeout(mouseLeaveTimeout);

        var _mouseTriggered = mouseTriggered;
        if ((ytcenter.settings.hideHeaderWhenPlayerPlayingMouseVisibility && e.clientY <= threshold && e.clientY >= 0) || document.getElementById("guide").contains(e.target)) {
          mouseTriggered = true;
        } else {
          mouseTriggered = false;
        }
        if (mouseTriggered !== _mouseTriggered) {
          update();
        }
      }
      function onMouseOut(e) {
        e = e || window.event;

        var from = e.relatedTarget || e.toElement;
        if (!from || from.nodeName === "HTML") {
          var obj = {};
          obj.clientY = -1;

          onMouseMoveThrottled(obj);

          /*mouseLeaveTimeout !== null && clearTimeout(mouseLeaveTimeout);
          mouseLeaveTimeout = setTimeout(function(){
            mouseLeaveTimeout = null;
            onMouseMoveThrottled(obj);
          }, 200);*/
        }
      }

      function updateTransitionTime() {
        var seconds = (ytcenter.settings.hideHeaderWhenPlayerPlayingTransitionTime || 600)/1000;
        ytcenter.utils.setCustomCSS("ytcenter-hide-header-transition", "body.hide-header-transition #masthead-positioner {\
          transition: top " + seconds + "s !important;\
          -moz-transition: top " + seconds + "s !important;\
          -ms-transition: top " + seconds + "s !important;\
          -o-transition: top " + seconds + "s !important;\
          -webkit-transition: top " + seconds + "s !important;\
        }\
        body.hide-header-transition #masthead-positioner-height-offset {\
          transition: height " + seconds + "s !important;\
          -moz-transition: height " + seconds + "s !important;\
          -ms-transition: height " + seconds + "s !important;\
          -o-transition: height " + seconds + "s !important;\
          -webkit-transition: height " + seconds + "s !important;\
        }");
      }

      function updateTransition() {
        if (ytcenter.settings.hideHeaderWhenPlayerPlayingTransition) {
          ytcenter.utils.addClass(document.body, "hide-header-transition");
        } else {
          ytcenter.utils.removeClass(document.body, "hide-header-transition");
        }
      }

      function update() {
        var state = -1;
        var api = ytcenter.player.getAPI();

        if (api && api.getPlayerState && typeof api.getPlayerState === 'function') {
          state = ytcenter.player.getAPI().getPlayerState();
        } else {
          state = -1;
        }

        _update(state);
      }

      function _update(state) {
        if (ytcenter.settings.hideHeaderWhenPlayerPlaying) {
          if (typeof state !== 'number') {
            var api = ytcenter.player.getAPI();
            if (api && api.getPlayerState && typeof api.getPlayerState === 'function') {
              state = ytcenter.player.getAPI().getPlayerState();
            } else {
              state = -1;
            }
          }
          var header = document.getElementById('masthead-positioner');
          var headerHeight = 50;
          if (header) {
            headerHeight = header.clientHeight || header.offsetHeight || headerHeight;
          }

          var hc = ytcenter.utils.hasClass(document.body, "hide-header");
          if (state === 0 || state === 2 || state === 5 || ytcenter.getPage() !== 'watch' || mouseTriggered
              || (ytcenter.settings.hideHeaderWhenPlayerPlayingFocus && ((header && document.activeElement && header.contains(document.activeElement) && document.activeElement.tagName !== "BUTTON") || focusTriggered))) {
            if (hc) {
              ytcenter.utils.removeClass(document.body, "hide-header");
              ytcenter.player._updateResize();
            }
          } else {
            if (!hc) {
              ytcenter.utils.addClass(document.body, "hide-header");
              ytcenter.player._updateResize();
            }
          }
        } else {
          ytcenter.utils.removeClass(document.body, "hide-header");
          ytcenter.player._updateResize();
        }
      }

      function updateEventListeners() {
        if (ytcenter.page !== "watch") return;
        
        var header = document.getElementById('masthead-positioner');
        if (header) {
          if (!focusListenersAdded) {
            if (ytcenter.settings.hideHeaderWhenPlayerPlayingFocus) {
              header.addEventListener('focus', onFocus, true);
              header.addEventListener('blur', onBlur, true);
              focusListenersAdded = true;
            }
          } else {
            header.removeEventListener('focus', onFocus, true);
            header.removeEventListener('blur', onBlur, true);
            focusListenersAdded = false;
          }
        }
        if (!mouseListenersAdded) {
          if (ytcenter.settings.hideHeaderWhenPlayerPlayingMouseVisibility) {
            window.addEventListener('mousemove', onMouseMoveThrottled, false);
            document.addEventListener('mouseout', onMouseOut, false);
            mouseListenersAdded = true;
          }
        } else {
          window.removeEventListener('mousemove', onMouseMoveThrottled, false);
          document.removeEventListener('mouseout', onMouseOut, false);
          mouseListenersAdded = false;
        }
      }

      // Throttled functions
      var onMouseMoveThrottled = ytcenter.utils.throttle(onMouseMove, 50);

      var forceVisibility = false;

      var focusTriggered = false;
      var mouseTriggered = false;

      var focusListenersAdded = false;
      var mouseListenersAdded = false;

      var mouseLeaveTimeout = null;

      var exports = {};

      exports.init = init;
      exports.update = update;
      exports.updateEventListeners = updateEventListeners;
      exports.updateTransition = updateTransition;
      exports.updateTransitionTime = updateTransitionTime;

      return exports;
    })();

    ytcenter.autoplayRecommendedVideo = (function(){
      function init() {
        autoplayCheckbox = document.getElementById("autoplay-checkbox");
        initListeners();
        initInterval();

        setChecked(ytcenter.settings.enableEndscreenAutoplay);
      }

      function initListeners() {
        if (autoplayCheckbox) {
          autoplayCheckbox.addEventListener("change", onChange, false);
        }
      }

      function initInterval() {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        interval = setInterval(update, 500);
      }

      function onChange() {
        toggled = !toggled;
      }

      function isChecked() {
        return autoplayCheckbox && autoplayCheckbox.checked;
      }

      function setChecked(checked) {
        if (autoplayCheckbox) {
          autoplayCheckbox.checked = toggled = !!checked;
        }
      }

      function update() {
        if (autoplayCheckbox && autoplayCheckbox.checked !== toggled) {
          setChecked(toggled);
        }
      }

      var autoplayCheckbox = null;
      var toggled = false;

      var interval = null;

      var exports = {};

      exports.init = init;
      exports.isChecked = isChecked;
      exports.setChecked = setChecked;
      exports.update = update;

      return exports;
    })();

    ytcenter.playerDocking = (function(){
      function init() {
        if (playerOffset && playerOffset.parentNode && typeof playerOffset.parentNode.removeChild === "function") {
          playerOffset.parentNode.removeChild(playerOffset);
        }

        playerOffset = document.createElement("div");
        playerOffset.setAttribute("id", "player-dock-offset");
        playerOffset.className = "player-width player-height";
        var player = document.getElementById('player');
        if (player) {
          if (player.nextSibling) {
            player.parentNode.insertBefore(playerOffset, player.nextSibling);
          } else {
            player.parentNode.appendChild(playerOffset);
          }
        }

        update();
      }
      function updateSize(width, height) {
        if (playerOffset) {
          playerOffset.style.width = width + 'px';
          playerOffset.style.height = height + 'px';
        }
      }
      function update() {
        if (ytcenter.settings.enablePlayerDocking) {
          ytcenter.utils.addClass(document.body, 'player-dock');
        } else {
          ytcenter.utils.removeClass(document.body, 'player-dock');
        }
      }

      var playerOffset = null;

      var exports = {};
      exports.update = update;
      exports.init = init;
      exports.updateSize = updateSize;

      return exports;
    })();

    /*> player.js */
    
    ytcenter.effects = {};

    /*> effect_glow.js */
    
    ytcenter.parseStreams = function(playerConfig){
      if (playerConfig.url_encoded_fmt_stream_map === "") return [];
      var parser1 = function(f){
        var a, r = [];
        try {
          var a = f.split(",");
          for (var i = 0; i < a.length; i++) {
            var b = a[i].split("/");
            var itag = b.shift();
            var dimension = b.shift();
            var minMajorFlashVersion = b.shift();
            var minMinorFlashVersion = b.shift();
            var revisionVersion = b.shift();
            r.push({
              itag: itag,
              dimension: dimension,
              flashVersion: {
                minMajor: minMajorFlashVersion,
                minMinor: minMinorFlashVersion,
                revision: revisionVersion
              }
            });
          }
        } catch (e) {
          con.error("[parseStreams] Error =>");
          con.error(e);
        }
        return r;
      };
      var parser2 = function(u){
        var a, b = [];
        try {
          a = u.split(",");
          for (var i = 0; i < a.length; i++) {
            var c = {};
            var d = a[i].split("&");
            for (var j = 0; j < d.length; j++) {
              var e = d[j].split("=");
              c[e[0]] = unescape(e[1]);
              if (e[0] === "type") c[e[0]] = c[e[0]].replace(/\+/g, " ");
            }
            b.push(c);
          }
        } catch (e) {
          con.error("[parseStreams] Error =>");
          con.error(e);
        }
        return b;
      };
      var parser3 = function(u){
        if (!u) return [];
        var a = u.split(",");
        var b = [];
        for (var i = 0; i < a.length; i++) {
          var c = {};
          var d = a[i].split("&");
          for (var j = 0; j < d.length; j++) {
            var e = d[j].split("=");
            c[e[0]] = unescape(e[1]);
            if (e[0] === "type") c[e[0]] = c[e[0]].replace(/\+/g, " ");
          }
          b.push(c);
        }
        return b;
      };
      var fmt = parser1(playerConfig.fmt_list);
      var streams = parser2(playerConfig.url_encoded_fmt_stream_map);
      var adaptive_fmts = parser3(playerConfig.adaptive_fmts);
      var a = [], i;
      for (i = 0; i < streams.length; i++) {
        var fl = null;
        for (var j = 0; j < fmt.length; j++) {
          if (streams[i].itag !== fmt[j].itag) continue;
          fl = fmt[j];
          break;
        }
        streams[i].dash = false;
        if (fl == null) {
          a.push(streams[i]);
        } else {
          var coll = streams[i];
          coll.dimension = fl.dimension;
          coll.flashVersion = fl.flashVersion;
          a.push(coll);
        }
      }
      for (i = 0; i < adaptive_fmts.length; i++) {
        adaptive_fmts[i].dash = true;
        a.push(adaptive_fmts[i]);
      }
      
      return a;
    };

    /*> class_management.js */

    ytcenter.intelligentFeed = (function(){
      var exports = {}, observer, config = { attributes: true }, feed;
      ytcenter.unload(function(){
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      });
      exports.getFeeds = function(){
        return document.getElementsByClassName("feed-item-main");
      };
      exports.getItems = function(feed){
        return feed.getElementsByClassName("yt-uix-shelfslider-item");
      };
      exports.getShelfWrappers = function(feed){
        return feed.getElementsByClassName("shelf-wrapper");
      };
      exports.getShelves = function(feed){
        return feed.getElementsByClassName("yt-uix-shelfslider-list");
      };
      exports.getFeedCollapsedContainer = function(feed){
        return feed.getElementsByClassName("feed-item-collapsed-container");
      };
      exports.getCollapsedItems = function(feed){
        return feed.getElementsByClassName("feed-item-collapsed-items");
      };
      exports.getShowMoreButton = function(feed){
        var a = feed.getElementsByClassName("feed-item-expander-button");
        if (a && a.length > 0 && a[0])
          return a[0];
        return null;
      };
      exports.setup = function(){
        exports.dispose();
        var shelf, items, i, j, shelfWrappers, collapsedItem, feedCollapsedContainer, showMoreButton;
        feed = exports.getFeeds();
        for (i = 0; i < feed.length; i++) {
          items = exports.getItems(feed[i]);
          shelf = exports.getShelves(feed[i]);
          shelfWrappers = exports.getShelfWrappers(feed[i]);
          collapsedItem = exports.getCollapsedItems(feed[i]);
          feedCollapsedContainer = exports.getFeedCollapsedContainer(feed[i]);
          showMoreButton = exports.getShowMoreButton(feed[i]);
          
          if (items && items.length > 0
              && shelf && shelf.length > 0 && shelf[0]
              && shelfWrappers && shelfWrappers.length > 0
              && feedCollapsedContainer && feedCollapsedContainer.length > 0 && feedCollapsedContainer[0]) {
            ytcenter.utils.addClass(feed[i], "ytcenter-intelligentfeed ytcenter-intelligentfeed-minimized");
            
            shelf = shelf[0];
            for (j = 0; j < items.length; j++) {
              shelf.appendChild(items[j]);
            }
            if (showMoreButton) {
              showMoreButton.setAttribute("data-original-textContent", showMoreButton.textContent);
              showMoreButton.textContent = showMoreButton.textContent.replace(/( [0-9]+)|([0-9]+ )|([0-9]+)/, "");
            }
            
            observer = ytcenter.mutation.observe(feedCollapsedContainer[0], config, function(mutations){
              mutations.forEach(function(mutation){
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                  if (ytcenter.utils.hasClass(mutation.target, "expanded")) {
                    ytcenter.utils.removeClass(mutation.target.parentNode.parentNode, "ytcenter-intelligentfeed-minimized");
                  } else if (ytcenter.utils.hasClass(mutation.target, "collapsed")) {
                    ytcenter.utils.addClass(mutation.target.parentNode.parentNode, "ytcenter-intelligentfeed-minimized");
                  }
                }
              });
            });
          }
        }
      };
      exports.dispose = function(){
        if (observer) observer.disconnect();
        observer = null;
        if (feed) {
          var shelves, items, i, j, k, frag, _items, showMoreButton;
          for (i = 0; i < feed.length; i++) {
            if (ytcenter.utils.hasClass(feed[i], "ytcenter-intelligentfeed")) {
              shelves = exports.getShelves(feed[i]);
              items = exports.getItems(feed[i]);
              showMoreButton = exports.getShowMoreButton(feed[i]);
              frag = [];
              _items = [];
              
              con.log("[Intelligent Feeds] Reordering " + items.length + " items to " + shelves.length + " shelves!");
              
              for (j = 0; j < items.length; j++) {
                var n = Math.floor(j/(items.length/shelves.length));
                if (!_items[n]) _items[n] = [];
                _items[n].push(items[j]);
              }
              
              for (j = 0; j < _items.length; j++) {
                for (k = 0; k < _items[j].length; k++) {
                  shelves[j].appendChild(_items[j][k]);
                }
              }
              if (showMoreButton) {
                showMoreButton.textContent = showMoreButton.getAttribute("data-original-textContent");
                showMoreButton.removeAttribute("data-original-textContent");
              }
              ytcenter.utils.removeClass(feed[i], "ytcenter-intelligentfeed ytcenter-intelligentfeed-minimized");
            }
          }
        }
      };
      return exports;
    })();

    /*> guide.js */

    ytcenter.events.addEvent("ui-refresh", function(){
      if (ytcenter.settings.removeBrandingBanner) {
        ytcenter.utils.addClass(document.body, "ytcenter-branding-remove-banner");
      } else {
        ytcenter.utils.removeClass(document.body, "ytcenter-branding-remove-banner");
      }
      if (ytcenter.settings.removeBrandingBackground) {
        ytcenter.utils.addClass(document.body, "ytcenter-branding-remove-background");
      } else {
        ytcenter.utils.removeClass(document.body, "ytcenter-branding-remove-background");
      }
      ytcenter.classManagement.updateClassesByGroup(["player-branding", "page"]);
    });
    
    ytcenter.cssElements = {};
    ytcenter.unsafeInit = function(){
      // Settings made public
      ytcenter.unsafe.injected = injected;
      ytcenter.unsafe.settings = ytcenter.unsafe.settings || {};
      ytcenter.unsafe.getDebug = ytcenter.utils.oldBind(function(){
        return ytcenter.getDebug();
      }, ytcenter.unsafe);
      ytcenter.unsafe.updateSignatureDecipher = ytcenter.utils.oldBind(function(){
        uw.postMessage("YouTubeCenter" + JSON.stringify({
          type: "updateSignatureDecipher"
        }), (loc.href.indexOf("http://") === 0 ? "http://www.youtube.com" : "https://www.youtube.com"));
      }, ytcenter.unsafe);
      ytcenter.unsafe.settings.setOption = ytcenter.utils.oldBind(function(key, value){
        ytcenter.settings[key] = value;
        ytcenter.events.performEvent("settings-update");
        uw.postMessage("YouTubeCenter" + JSON.stringify({
          type: "saveSettings"
        }), (loc.href.indexOf("http://") === 0 ? "http://www.youtube.com" : "https://www.youtube.com"));
      }, ytcenter.unsafe.settings);
      ytcenter.unsafe.settings.getOption = ytcenter.utils.oldBind(function(key){
        return ytcenter.settings[key];
      }, ytcenter.unsafe.settings);
      ytcenter.unsafe.settings.getOptions = ytcenter.utils.oldBind(function(){
        return ytcenter.settings;
      }, ytcenter.unsafe.settings);
      ytcenter.unsafe.settings.removeOption = ytcenter.utils.oldBind(function(key){
        delete ytcenter.settings[key];
        ytcenter.events.performEvent("settings-update");
        uw.postMessage("YouTubeCenter" + JSON.stringify({
          type: "saveSettings"
        }), (loc.href.indexOf("http://") === 0 ? "http://www.youtube.com" : "https://www.youtube.com"));
      }, ytcenter.unsafe.settings);
      ytcenter.unsafe.settings.listOptions = ytcenter.utils.oldBind(function(){
        var keys = [];
        for (var key in ytcenter.settings) {
          if (ytcenter.settings.hasOwnProperty(key)) keys.push(key);
        }
        return keys;
      }, ytcenter.unsafe.settings);
      ytcenter.unsafe.settings.reload = ytcenter.utils.oldBind(function(){
        uw.postMessage("YouTubeCenter" + JSON.stringify({
          type: "loadSettings"
        }), (loc.href.indexOf("http://") === 0 ? "http://www.youtube.com" : "https://www.youtube.com"));
      }, ytcenter.unsafe.settings);
      
      ytcenter.utils.addEventListener(uw, "message", function(e){
        if (e.origin !== "http://www.youtube.com" && e.origin !== "https://www.youtube.com")
          return;
        if (!e || !e.data) return; // Checking if data is present
        if (typeof e.data !== "string") return; // Checking if the object is a string.
        if (!e.data.indexOf || e.data.indexOf("YouTubeCenter") !== 0) return; // Checking if the token is present at the start of the string
        var d = JSON.parse(e.data.substring(13));
        if (d.type === "saveSettings") {
          ytcenter.saveSettings();
        } else if (d.type === "loadSettings") {
          ytcenter.loadSettings();
        } else if (d.type === "updateSignatureDecipher") {
          ytcenter.utils.updateSignatureDecipher();
        }
        if (typeof d.callback === "function") {
          var n = d.callback.split("."), a = uw, i;
          for (i = 0; o < n.length; i++) {
            a = a[n[i]];
          }
          a();
        }
      }, false);
    };

    /*> init.js */
  };
  // Utils
  function bind(scope, func) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function(){
      return func.apply(scope, args.concat(Array.prototype.slice.call(arguments)))
    };
  }

  function map(obj, callback, thisArg) {
    for (var i = 0, n = obj.length, a = []; i < n; i++) {
      if (i in obj) a[i] = callback.call(thisArg, obj[i]);
    }
    return a;
  }

  function trimLeft(obj){
    return obj.replace(/^\s+/, "");
  }
  function trimRight(obj){
    return obj.replace(/\s+$/, "");
  }

  function setCookie(name, value, domain, path, expires) {
    domain = domain ? ";domain=" + encodeURIComponent(domain) : "";
    path = path ? ";path=" + encodeURIComponent(path) : "";
    expires = 0 > expires ? "" : 0 == expires ? ";expires=" + (new Date(1970, 1, 1)).toUTCString() : ";expires=" + (new Date(now() + 1E3 * expires)).toUTCString();
    
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + domain + path + expires;
  }

  function getCookie(key) {
    return getCookies()[key];
  }

  function getCookies() {
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
        var name = $0, value = $1.charAt(0) === '"' ? $1.substr(1, -1).replace(/\\(.)/g, "$1") : $1;
        cookies[name] = value;
      });
    }
    return cookies;
  }

  var now = Date.now || function () {
    return +new Date;
  };

  // Support
  var support = (function(){
    function localStorageTest() {
      try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
      } catch (e) {
        return false;
      }
    }
    
    function customEvent() {
      try {
        var e = document.createEvent('CustomEvent');
        if (e && typeof e.initCustomEvent === "function") {
          e.initCustomEvent(mod, true, true, { mod: mod });
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    }
    
    function gmCheck() {
      try {
        if (typeof GM_setValue !== "undefined") {
          try {
            if ((typeof GM_setValue.toString === "undefined" || GM_setValue.toString().indexOf("not supported") === -1)) {
              return true;
            } else {
              return false;
            }
          } catch (e) {
            return true;
          }
        }
      } catch (e) {
        return false;
      }
    }
    
    function firefoxCloneInto() {
      try {
        if (typeof cloneInto === "function") {
          return true;
        }
      } catch (e) { }
      return false;
    }
    
    var mod = "support.test";
    
    return {
      localStorage: localStorageTest(),
      Greasemonkey: gmCheck(),
      Adguard: (typeof AdguardSettings === "object"),
      cloneInto: firefoxCloneInto(),
      CustomEvent: customEvent()
    };
  })();

  // Chrome API
  function chrome_save(id, key, data) {
    if (typeof data !== "string") data = JSON.stringify(data);
    
    if (chrome && chrome.storage && chrome.storage.local) {
      var storage = chrome.storage.local;
      var details = {};
      details[key] = data;
      storage.set(details);
      
      callUnsafeWindow(id);
    } else {
      console.warn("[Chrome] Chrome extension API is not present!");
      setTimeout(function(){
        defaultSave(id, key, data);
      }, 7);
    }
  }

  function chrome_load(id, key) {
    if (chrome && chrome.storage && chrome.storage.local) {
      var storage = chrome.storage.local;
      var value = null;
      if (support.localStorage && (value = localStorage.getItem(key) || null) !== null) {
        var details = {};
        details[key] = value;
        
        storage.set(details);
        
        localStorage.removeItem(key);
        callUnsafeWindow(id, value);
      } else {
        storage.get(key, function(result) {
          var res = {};
          if (key in result) {
            res = result[key];
          }
          
          callUnsafeWindow(id, res);
        });
      }
    } else {
      console.warn("[Chrome] Chrome extension API is not present!");
      setTimeout(function(){
        defaultLoad(id, key);
      }, 7);
    }
  }
  
  function _chrome_load(key, callback) {
    if (chrome && chrome.storage && chrome.storage.local) {
      var storage = chrome.storage.local;
      var value = null;
      if (support.localStorage && (value = localStorage.getItem(key) || null) !== null) {
        var details = {};
        details[key] = value;
        
        storage.set(details);
        
        localStorage.removeItem(key);
        callback(value);
      } else {
        storage.get(key, function(result) {
          var res = {};
          if (key in result) {
            res = result[key];
          }
          
          callback(res);
        });
      }
    } else {
      console.warn("[Chrome] Chrome extension API is not present!");
      setTimeout(function(){
        _defaultLoad(key, callback);
      }, 7);
    }
  }

  // Safari API
  function safariMessageListener(e) {
    if (!e || !e.message) return; // Checking if data is present
    if (typeof e.message !== "string") return; // Checking if the object is a string.
    if (!e.message.indexOf || e.message.indexOf("{") !== 0) return;
    
    var d = JSON.parse(e.message);
    if (d.level !== "safe") {
      return;
    }
    
    if (e.name === "call") {
      if (d.id < 0) {
        var id = (d.id * -1) - 1;
        _callback[id].apply(null, d.arguments);
      } else {
        var args = [d.id].concat(d.arguments);
        callUnsafeWindow.apply(null, args);
      }
    }
  }
  
  // Opera API
  function operaMessageListener(e) {
    if (!e || !e.data) return; // Checking if data is present
    if (typeof e.data !== "string") return; // Checking if the object is a string.
    if (!e.data.indexOf || e.data.indexOf("{") !== 0) return;
    
    var d = JSON.parse(e.data);
    if (d.level !== "safe") {
      return;
    }
    
    if (d.id < 0) {
      var id = (d.id * -1) - 1;
      _callback[id].apply(null, d.arguments);
    } else {
      callUnsafeWindow.apply(null, [d.id].concat(d.arguments));
    }
  }
  
  // Firefox API
  function onFirefoxEvent() {
    callUnsafeWindow.apply(null, arguments);
  }

  // General
  function callUnsafeWindow(id) {
    if (typeof id === "number" || typeof id === "string") {
      if (support.CustomEvent) {
        callUnsafeWindowEvent.apply(null, arguments);
      } else {
        callUnsafeWindowMessage.apply(null, arguments);
      }
    }
  }

  function jsonReplacer(key, value) {
    if ((typeof key === "string" && key !== "" && typeof value === "function") || value instanceof Document) {
      return value.toString();
    }
    return value;
  }
  
  function callUnsafeWindowMessage(id) {
    if (typeof id === "number" || typeof id === "string") {
      var args = Array.prototype.slice.call(arguments, 1);
      window.postMessage(JSON.stringify({ level: "safe", id: id, arguments: args }, jsonReplacer), "*");
    }
  }
  
  /*function copyObject(obj) {
    if (Object.prototype.toString.call(obj) === "[object Array]") {
      var newObj = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        newObj.push(copyObject(obj[i]));
      }
      return newObj;
    } else if (typeof obj === "object") {
      var newObj = {};
      for (var key in obj) {
        newObj[key] = copyObject(obj[key]);
      }
      return newObj;
    }
    return obj;
  }*/
  
  function callUnsafeWindowEvent(id) {
    if (typeof id === "number" || typeof id === "string") {
      var args = Array.prototype.slice.call(arguments, 1);
      var detail = { id: id, arguments: args };
      
      try {
        var detailString = JSON.stringify(detail, jsonReplacer);
      } catch (e) {
        console.log(detail, typeof Node);
        console.error(e);
      }

      var e = document.createEvent("CustomEvent");
      e.initCustomEvent("ytc-page-call", true, true, detailString);
      document.documentElement.dispatchEvent(e);
    }
  }
  
  function eventListener(e) {
    var detail = JSON.parse(e.detail);
    
    if (@identifier@ === 4) { // Safari
      safari.self.tab.dispatchMessage("call", e.detail); // Redirect event to the extension
    } else if (@identifier@ === 5) { // Opera
      opera.extension.postMessage(e.detail); // Redirect event to the extension
    } else {
      setTimeout(function(){ handleMethods(detail); }, 0);
    }
    
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
  }

  function messageListener(e) {
    if (!e || !e.data) return; // Checking if data is present
    if (typeof e.data !== "string") return; // Checking if the object is a string.
    if (!e.data.indexOf || e.data.indexOf("{") !== 0) return;
    
    var d = JSON.parse(e.data);
    if (d.level !== "unsafe") {
      return;
    }
    
    if (@identifier@ === 4) { // Safari
      safari.self.tab.dispatchMessage("call", e.data); // Redirect message to the extension
    } else if (@identifier@ === 5) { // Opera
      opera.extension.postMessage(e.data); // Redirect message to the extension
    } else {
      handleMethods(d);
    }
  }

  function handleMethods(data) {
    switch (data.method) {
      case "xhr":
        xhr(data.arguments[0]);
        break;
      case "save":
        save(data.id, data.arguments[0], data.arguments[1]);
        break;
      case "load":
        load(data.id, data.arguments[0]);
        break;
      case "firefox_addWindowListener":
        addWindowListener(bind(null, callUnsafeWindow, data.id));
        break;
      case "firefox_windowLinkerFireRegisteredEvent":
        windowLinkerFireRegisteredEvent(data.arguments[0], data.arguments[1]);
        break;
      case "GM_registerMenuCommand":
        if (support.Greasemonkey) {
          setTimeout(function(){
            GM_registerMenuCommand(data.arguments[0], bind(null, callUnsafeWindow, data.id));
          }, 7);
        }
        break;
      default:
        console.log("Unknown method: " + method + ", with data:", data);
    }
  }
  
  function adguard_xhr_getURL(details) {
    var encodeHeaders = function (headers) {
      if (typeof headers == "object") {
        var result = "";
        for (header in headers) result += encodeURIComponent(header) + ":" + encodeURIComponent(headers[header]) + ",";
        return result.slice(0, -1)
      }
      if (typeof headers == "string") return encodeURIComponent(headers);
      return null
    };
    var url = (settings.testDomain ? settings.testDomain : utils.getHostWithProtocol()) + settings.apiurl + settings.apiType + "?type=gm-xml-http-request";
    var urlData = {};
    urlData.url = encodeURIComponent(details.url || "");
    urlData.data = encodeURIComponent(details.data || "");
    urlData.headers = encodeHeaders(details.headers || "");
    urlData.method = encodeURIComponent(details.method || "");
    urlData.overridemimetype = encodeURIComponent(details.overridemimetype || "");
    urlData.user = encodeURIComponent(details.user || "");
    urlData.password = encodeURIComponent(details.password || "");
    
    var prepareURL = [];
    
    for (var key in urlData) {
      if (urlData.hasOwnProperty(key)) {
        prepareURL.push(key + "=" + urlData[key]);
      }
    }
    url += "&" + prepareURL.join("&");
    return url;
  }
  
  function adguard_xhr(details) {
    var xmlhttp;
    if (typeof XMLHttpRequest !== "undefined") {
      xmlhttp = new XMLHttpRequest();
    } else if (typeof opera !== "undefined" && typeof opera.XMLHttpRequest !== "undefined") {
      xmlhttp = new opera.XMLHttpRequest();
    } else {
      details["onerror"](responseState);
      return;
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
      xmlhttp.open(details.method, adguard_xhr_getURL(details));
    } catch (e) {
      details["onerror"]();
    }
    if (details.headers) {
      for (var prop in details.headers) {
        xmlhttp.setRequestHeader(prop, details.headers[prop]);
      }
    }
    xmlhttp.send((typeof(details.data) !== 'undefined') ? details.data : null);
  }

  function xhr(details) {
    createCallableDetails(details);
    if (@identifier@ === 6) { // Firefox
      request(details);
    } else if (support.Greasemonkey) {
      setTimeout(function(){
        GM_xmlhttpRequest(details);
      }, 7);
    } else {
      var xmlhttp;
      if (typeof XMLHttpRequest != "undefined") {
        xmlhttp = new XMLHttpRequest();
      } else if (typeof opera != "undefined" && typeof opera.XMLHttpRequest != "undefined") {
        xmlhttp = new opera.XMLHttpRequest();
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
    }
  }

  function createCallableDetails(details) {
    var callback = ["abort", "error", "load", "progress", "readystatechange", "timeout"];
    for (var i = 0, len = callback.length; i < len; i++) {
      var on = details["on" + callback[i]];
      if (typeof on === "number") {
        details["on" + callback[i]] = bind(null, callUnsafeWindow, on);
      }
    }
  }

  function save(id, key, data) {
    if (typeof data !== "string") data = JSON.stringify(data);
    if (@identifier@ === 1 || @identifier@ === 8) {
      chrome_save(id, key, data);
    } else if (@identifier@ === 2) {
      callUnsafeWindow(id, window.external.mxGetRuntime().storage.setConfig(key, data));
    } else if (@identifier@ === 6) {
      callUnsafeWindow(id, storage_setValue(key, data));
    } else {
      setTimeout(function(){
        defaultSave(id, key, data);
      }, 7);
    }
  }
  
  function defaultSave(id, key, data) {
    if (support.Greasemonkey) {
      callUnsafeWindow(id, GM_setValue(key, data));
    } else if (support.localStorage) {
      callUnsafeWindow(id, localStorage.setItem(key, data));
    } else {
      callUnsafeWindow(id, setCookie(key, data, null, "/", 86400000000));
    }
  }

  function load(id, key) {
    if (@identifier@ === 1 || @identifier@ === 8) {
      chrome_load(id, key);
    } else if (@identifier@ === 2) {
      callUnsafeWindow(id, window.external.mxGetRuntime().storage.getConfig(key) || "{}");
    } else if (@identifier@ === 6) {
      callUnsafeWindow(id, storage_getValue(key) || "{}");
    } else {
      setTimeout(function() {
        defaultLoad(id, key);
      }, 7);
    }
  }
  
  function defaultLoad(id, key) {
    if (support.Greasemonkey) {
      callUnsafeWindow(id, GM_getValue(key) || "{}");
    } else if (support.localStorage) {
      callUnsafeWindow(id, localStorage.getItem(key) || "{}");
    } else {
      callUnsafeWindow(id, getCookie(key) || "{}");
    }
  }
  
  function _load(key, callback) {
    if (@identifier@ === 4) { // Safari
      safari.self.tab.dispatchMessage("call", JSON.stringify({
        level: "unsafe",
        method: "load",
        id: parseInt("-" + _callback.push(callback), 10),
        arguments: [ key ]
      }));
    } else if (@identifier@ === 5) { // Opera
      opera.extension.postMessage(JSON.stringify({
        level: "unsafe",
        method: "load",
        id: parseInt("-" + _callback.push(callback), 10),
        arguments: [ key ]
      }));
    } else if (@identifier@ === 1 || @identifier@ === 8) {
      _chrome_load(key, callback);
    } else if (@identifier@ === 2) {
      callback(window.external.mxGetRuntime().storage.getConfig(key) || "{}");
    } else if (@identifier@ === 6) {
      callback(storage_getValue(key) || "{}");
    } else {
      setTimeout(function() {
        _defaultLoad(key, callback);
      }, 7);
    }
  }
  
  function _defaultLoad(key, callback) {
    if (support.Greasemonkey) {
      callback(GM_getValue(key) || "{}");
    } else if (support.localStorage) {
      callback(localStorage.getItem(key) || "{}");
    } else {
      callback(getCookie(key) || "{}");
    }
  }
  
  function windowUnload() {
    window.removeEventListener("message", messageListener, false);
    window.removeEventListener("unload", windowUnload, false);
    if (@identifier@ === 4) { // Safari
      safari.self.removeEventListener("message", safariMessageListener, false);
    } else if (@identifier@ === 5) { // Opera
      opera.extension.onmessage = null;
    }
  }
  
  function isDomainAllowed(domains) {
    var domain = document.domain;
    
    for (var i = 0, len = domains.length; i < len; i++) {
      if (domain === domains[i]) {
        return true;
      }
    }
    return false;
  }
  
  function initListeners() {
    if (initializedListeners) return;
    initializedListeners = true;
    
    if (support.CustomEvent) {
      window.addEventListener("ytc-content-call", eventListener, false);
    } else {
      window.addEventListener("message", messageListener, false);
    }
    
    window.addEventListener("unload", windowUnload, false);
  }
  
  function initExtensionListeners() {
    if (initializedExtensionListeners) return;
    initializedExtensionListeners = true;
    
    if (@identifier@ === 4) { // Safari
      safari.self.addEventListener("message", safariMessageListener, false);
    } else if (@identifier@ === 5) { // Opera
      opera.extension.onmessage = operaMessageListener;
    }
  }
  
  var now = Date.now || function () {
    return +new Date;
  };
  var initializedListeners = false;
  var initializedExtensionListeners = false;
  var hasInjected = false;
  
  var _callback = [];
  var ie = (function(){
    try {
      for (var v = 3, el = document.createElement('b'), all = el.all || []; el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->', all[0];);
      return v > 4 ? v : !!document.documentMode;
    } catch (e) {
      return false;
    }
  }());
  
  var domains = ["www.youtube.com", "youtube.com", "apis.google.com", "plus.googleapis.com"];
  var loc = (function(){
    try {
      if (typeof location !== "undefined") return location;
      if (typeof window !== "undefined" && typeof window.location !== "undefined") return window.location;
      if (typeof unsafeWindow !== "undefined" && typeof unsafeWindow.location !== "undefined") return unsafeWindow.location;
    } catch (e) {}
  })();
  if (isDomainAllowed(domains)) { // Let's do a check to see if @name@ should run.
    console.log("Domain registered " + document.domain + ".");
    
    if (isEmbeddedVideo() && isCookieEnabled()) {
      console.log("cookie");
      try {
        var cookies = getCookies();
        var cookie = ("ytc_embed" in cookies ? cookies["ytc_embed"] : null);
        if (cookie === "enabled") {
          initListeners();
          initExtensionListeners();
          inject(main_function);
        } else {
          initExtensionListeners();
        }
        
        _load("YouTubeCenterSettings", function(settings){
          if (typeof settings === "string") settings = JSON.parse(settings);
          
          if (settings.embed_enabled && cookie !== "enabled") {
            setCookie("ytc_embed", "enabled", ".youtube.com", "/", 3600*60*24*30);
            loc.reload();
          } else if (!settings.embed_enabled && cookie === "enabled") {
            setCookie("ytc_embed", "disabled", ".youtube.com", "/", 3600*60*24*30);
            loc.reload();
          }
        });
      } catch (e) {
        console.error(e);
        
        initListeners();
        initExtensionListeners();
        inject(main_function);
      }
    } else {
	  injectScript(function(){ window.matchMedia = null; }, "matchMediaOverride.js");
      console.log("default");
      /* Continue normally */
      initListeners();
      initExtensionListeners();
      inject(main_function);
    }
  } else {
    throw "Domain " + document.domain + " not allowed!";
  }
})();
