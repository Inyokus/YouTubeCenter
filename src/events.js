/* YouTube Center event system

   Known events:
   - "language-refresh"
   - "ui-refresh"
   - "save"
   - "save-complete"
   - "settings-update"
   - "resize-update"
   - "save-error"
 */

ytcenter.events = (function(){
    function SubscriptionEvent(type, fn) {
        this.type = type;
        this.fn = fn;

        this.flag = SubscriptionEvent.FLAG_DEFAULT;

        this.dispatch = ytcenter.utils.bind(this, this.dispatch);
        this.addEvent = ytcenter.utils.bind(this, this.addEvent);
        this.removeEvent = ytcenter.utils.bind(this, this.removeEvent);
        this.setFlag = ytcenter.utils.bind(this, this.setFlag);
    }
    SubscriptionEvent.FLAG_DEFAULT = "default";
    SubscriptionEvent.FLAG_DOM_UNLOAD = "unload";

    SubscriptionEvent.prototype.dispatch = function dispatch(scope) {
        var args = Array.prototype.splice.call(arguments, 1, arguments.length);
        this.fn.apply(scope, args);

        return this;
    }
    SubscriptionEvent.prototype.addEvent = function addEvent() {
        db.push(this);

        return this;
    }
    SubscriptionEvent.prototype.removeEvent = function removeEvent() {
        _removeEvent(this.type, this.fn);

        return this;
    }
    SubscriptionEvent.prototype.setFlag = function setFlag(flag) {
        this.flag = flag;

        return this;
    }

    function _addEvent(type, fn) {
        return (new SubscriptionEvent(type, fn)).addEvent();
    }

    function _removeEvent(type, fn) {
        for (var i = 0, len = db.length; i < len; i++) {
            if (db[i].type === type && db[i].fn === fn) {
                db.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    function _performEvent(type) {
        var staticArguments = Array.prototype.splice.call(arguments, 1, arguments.length);
        for (var i = 0, len = db.length; i < len; i++) {
            if (db[i].type === type) {
                try { db[i].dispatch.apply(db[i], [this].concat(staticArguments)); }
                catch (e) { con.error(e); }
            }
        }
    }

    function onDOMUnload() {
        for (var i = 0, len = db.length; i < len; i++) {
            if (db[i].flag === SubscriptionEvent.FLAG_DOM_UNLOAD) {
                db.splice(i, 1);
                i--; len--;
            }
        }
    }

    var db = [];

    ytcenter.spf.addEventListener("request", onDOMUnload);
    //window.addEventListener("unload", onDOMUnload, false);

    var exports = {};
    exports.addEvent = _addEvent;
    exports.removeEvent = _removeEvent;
    exports.performEvent = _performEvent;

    return exports;
})();