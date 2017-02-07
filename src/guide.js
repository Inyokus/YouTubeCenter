/* Controls the guide */

ytcenter.guideMode = (function(){
    function clickListener() {
        clicked = true;
    }
    function updateGuide() {
        if (ytcenter.getPage() !== "watch") return;
        if (ytcenter.settings.guideMode === "always_open") {
            ytcenter.utils.removeClass(document.getElementById("guide-main"), "collapsed");
            document.getElementById("guide-main").children[1].style.display = "block";
            document.getElementById("guide-main").children[1].style.height = "auto";
        } else if (ytcenter.settings.guideMode === "always_closed") {
            ytcenter.utils.addClass(document.getElementById("guide-main"), "collapsed");
            document.getElementById("guide-main").children[1].style.display = "none";
            document.getElementById("guide-main").children[1].style.height = "auto";
        }
    }
    var timer, observer, observer2, clicked = false, main_guide, guide_container, guideToggle,
        config = { attributes: true, attributeOldValue: true },
        confi2 = { childList: true, subtree: true };
    ytcenter.unload(function(){
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (observer2) {
            observer2.disconnect();
            observer2 = null;
        }
    });
    return {
        setup: function(){
            con.log("[Guide] Configurating the state updater!");
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (observer2) {
                observer2.disconnect();
                observer2 = null;
            }
            guideToggle = document.getElementsByClassName("guide-module-toggle")[0];
            if (guideToggle)
                ytcenter.utils.removeEventListener(guideToggle, "click", clickListener, false);
            if (ytcenter.settings.guideMode !== "default") {
                if (document.getElementById("guide")) {
                    observer2 = ytcenter.mutation.observe(document.getElementById("guide"), confi2, function(mutations){
                        mutations.forEach(function(mutation){
                            if (ytcenter.utils.inArray(mutation.removedNodes, guide_container)) {
                                con.log("[Guide] Main Guide has been removed");
                                main_guide = document.getElementById("guide-main");
                                guide_container = document.getElementById("guide-container");
                                if (main_guide) {
                                    if (observer) observer.disconnect();
                                    observer = ytcenter.mutation.observe(main_guide, config, function(mutations){
                                        mutations.forEach(function(mutation){
                                            if (mutation.type === "attributes" && mutation.attributeName === "class" && ((mutation.oldValue.indexOf("collapsed") !== -1) !== (mutation.target.className.indexOf("collapsed") !== -1))) {
                                                con.log("[Guide] Mutations...", mutation.oldValue.indexOf("collapsed") !== -1, mutation.target.className.indexOf("collapsed") !== -1, ytcenter.settings.guideMode);
                                                if (mutation.oldValue.indexOf("collapsed") === -1 && ytcenter.settings.guideMode === "always_closed") return;
                                                if (mutation.oldValue.indexOf("collapsed") !== -1 && ytcenter.settings.guideMode === "always_open") return;
                                                con.log("[Guide] Updating State!");

                                                uw.clearTimeout(timer);

                                                if (clicked) {
                                                    clicked = false;
                                                    return;
                                                }

                                                timer = uw.setTimeout(function(){
                                                    updateGuide();
                                                }, 500);
                                            }
                                        });
                                    });
                                }
                                if (guideToggle)
                                    ytcenter.utils.removeEventListener(guideToggle, "click", clickListener, false);
                                guideToggle = document.getElementsByClassName("guide-module-toggle")[0];
                                if (guideToggle)
                                    ytcenter.utils.addEventListener(guideToggle, "click", clickListener, false);
                                if (clicked) {
                                    clicked = false;
                                    return;
                                }
                                updateGuide();
                            } else {
                                con.log("[Guide] Main Guide is still intact");
                            }
                        });
                    });
                }
                main_guide = document.getElementById("guide-main");
                guide_container = document.getElementById("guide-container");
                if (main_guide) {
                    ytcenter.mutation.observe(main_guide, config, function(mutations){
                        mutations.forEach(function(mutation){
                            if (mutation.type === "attributes" && mutation.attributeName === "class" && ((mutation.oldValue.indexOf("collapsed") !== -1) !== (mutation.target.className.indexOf("collapsed") !== -1))) {
                                con.log("[Guide] Mutations...", mutation.oldValue.indexOf("collapsed") !== -1, mutation.target.className.indexOf("collapsed") !== -1, ytcenter.settings.guideMode);
                                if (mutation.oldValue.indexOf("collapsed") === -1 && ytcenter.settings.guideMode === "always_closed") return;
                                if (mutation.oldValue.indexOf("collapsed") !== -1 && ytcenter.settings.guideMode === "always_open") return;
                                con.log("[Guide] Updating State!");

                                uw.clearTimeout(timer);

                                if (clicked) {
                                    clicked = false;
                                    return;
                                }

                                timer = uw.setTimeout(function(){
                                    updateGuide();
                                }, 500);
                            }
                        });
                    });
                }
                if (guideToggle)
                    ytcenter.utils.addEventListener(guideToggle, "click", clickListener, false);
            }
            updateGuide();
        }
    };
})();