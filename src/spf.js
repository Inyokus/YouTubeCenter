/**
 * A wrapper for spfjs on YouTube.
 * @URL https://github.com/youtube/spfjs/
 */
ytcenter.spf = (function(){
    function bind(scope, func) {
        var args = Array.prototype.slice.call(arguments, 2);
        return function(){
            return func.apply(scope, args.concat(Array.prototype.slice.call(arguments)))
        };
    }
    function navigateWrapper(url, opt_options) {
        if (opt_options) {
            con.warn("opt_options are not supported in the navigateWrapper", url, opt_options);
        }
        loc.href = url;
    }
    function setEnabled(enabled) {
        if (enabled) {
            !isEnabled() && uw && uw.spf && uw.spf.init && uw.spf.init();

            if (spfNavigate) {
                uw.spf.navigate = spfNavigate;
            }

            if (spfElements) {
                for (var i = 0, len = spfElements.length; i < len; i++) {
                    ytcenter.utils.addClass(spfElements[i], "spf-link");
                }
            }
        } else {
            isEnabled() && uw && uw.spf && uw.spf.dispose && uw.spf.dispose();

            if (uw && uw.spf && uw.spf.navigate) {
                spfNavigate = uw.spf.navigate;
                uw.spf.navigate = navigateWrapper;
            }

            if (!spfElements) {
                spfElements = document.getElementsByClassName("spf-link");
            }
            for (var i = 0, len = spfElements.length; i < len; i++) {
                ytcenter.utils.removeClass(spfElements[i], "spf-link");
            }
        }
    }
    function isEnabled() {
        return (uw && uw._spf_state && uw._spf_state["history-init"]);
    }

    function addEventListener(event, callback) {
        if (!attachedEvents[event]) attachedEvents[event] = [];
        attachedEvents[event].push(callback);
    }

    function removeEventListener(event, callback) {
        if (!attachedEvents[event]) return;
        for (var i = 0, len = attachedEvents[event].length; i < len; i++) {
            if (attachedEvents[event][i] === callback) {
                attachedEvents[event].splice(i, 1);
                i--; len--;
            }
        }
    }

    function listener(event) {
        var args = Array.prototype.slice.call(arguments, 1);

        var detail = null;
        if (args.length > 0 && args[0] && args[0].detail) {
            detail = args[0].detail;
        }

        con.log("[SPF] " + event, detail);
        var listeners = attachedEvents[event];
        if (listeners) {
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].apply(this, args);
            }
        }
    }

    function init() {
        for (var i = 0, len = spfEvents.length; i < len; i++) {
            var boundListener = bind(null, listener, spfEvents[i]);
            events.push(boundListener);

            document.addEventListener(customEventPrefix + spfEvents[i], boundListener, false);
        }
    }

    function dispose() {
        if (events.length === spfEvents.length) {
            for (var i = 0, len = spfEvents.length; i < len; i++) {
                document.removeEventListener(customEventPrefix + spfEvents[i], events[i], false);
            }
            events = [];
        }
    }

    var customEventPrefix = "spf";
    var spfEvents = [ "cssbeforeunload", "cssunload", "done", "error", "history", "jsbeforeunload", "jsunload", "partdone", "partprocess", "process", "ready", "reload", "request" ];

    var attachedEvents = { };
    var events = [ ];

    var spfNavigate = null;
    var spfElements = null;

    init();

    var exports = {};
    exports.addEventListener = addEventListener;
    exports.removeEventListener = removeEventListener;
    exports.setEnabled = setEnabled;
    exports.isEnabled = isEnabled;
    exports.init = init;
    exports.dispose = dispose;

    return exports;
})();