/* Initialization sequence for each page load (actual page loads, is not re-executed
   on SPF navigation) */

(function(){
    function onBeforeUnload(e) {
        e = e || window.event;

        ytcenter.saveSettings(false);
    }

    window.addEventListener("beforeunload", onBeforeUnload, false);
})();

ytcenter._config_registered = false;
(function(){
    // Hijacks the ytplayer global variable.
    try {
        if (uw.ytplayer && uw.ytplayer.config) {
            ytcenter._config_registered = true;
            con.log("[Player Config Global] Player configuration already registered by YouTube.");
            if (uw.ytplayer.config.html5) {
                con.log("[Player] HTML5 configuration detected");
            }

            // Make sure that modify config is applied to the player configuration.
            ytcenter.player.setConfig(ytcenter.utils.mergeObjects(uw.ytplayer.config || {}, ytcenter.player.config || {}));
        }
        if (uw.ytplayer && uw.ytplayer.config && uw.ytplayer.config.loaded) {
            ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.ytplayer.config));
            ytcenter.player.disablePlayerUpdate = false;
        } else if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG && uw.yt.config_.PLAYER_CONFIG.loaded) {
            ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.yt.config_.PLAYER_CONFIG));
            ytcenter.player.disablePlayerUpdate = false;
        }
        if (uw.ytplayer && uw.ytplayer.config && uw.ytplayer.config.args) {
            ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.ytplayer.config));
            ytcenter.player.disablePlayerUpdate = false;
        } else if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG && uw.yt.config_.PLAYER_CONFIG.args) {
            ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.yt.config_.PLAYER_CONFIG));
            ytcenter.player.disablePlayerUpdate = false;
        }

        if (ytcenter.utils.setterGetterClassCompatible()) {
            ytcenter.player.disablePlayerUpdate = false;
            ytcenter.playerInstance.setProperty("config", function(config){
                con.log("[External] Setting player configruation.");
                if (config) {
                    ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), config));
                    if (ytcenter.player.config.html5) ytcenter.player.disablePlayerUpdate = true;
                } else {
                    ytcenter.player.setConfig(config);
                }
            }, function(){
                /*if (!ytcenter.player.config) {
                 ytcenter.player.config = ytcenter.player.modifyConfig("watch", ytcenter.player.getRawPlayerConfig());
                 }*/
                return ytcenter.player.config;
            });
        } else {
            con.log("[PlayerConfig Hijacker] Setter Getter Method not suppoted!");
            if (uw.ytplayer && uw.ytplayer.config) {
                ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.ytplayer.config));
            } else if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG) {
                ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.yt.config_.PLAYER_CONFIG));
            }
            ytcenter.player.disablePlayerUpdate = false;
        }
    } catch (e) {
        con.error(e);
        if (uw && uw.ytplayer && uw.ytplayer.config)
            ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.ytplayer.config));
        else if (uw.yt && uw.yt.config_ && uw.yt.config_.PLAYER_CONFIG)
            ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), uw.yt.config_.PLAYER_CONFIG));
        ytcenter.player.disablePlayerUpdate = false;
    }
    ytcenter.pageReadinessListener.waitfor = function(){
        return ytcenter.__settingsLoaded;
    };

    ytcenter.pageReadinessListener.addEventListener("headerInitialized", function(page){
        ytcenter.unsafeInit();

        ytcenter.language.update();

        /* We don't want to add everything. So only the neccessary stuff is added. */
        if (page === "comments") {
            ytcenter.cssElements.flags = ytcenter.utils.addCSS("flags", ytcenter.css.flags);
            return;
        }
        if (page === "embed" && !ytcenter.settings.embed_enabled) {
            ytcenter.embed._writeEmbed();
            return;
        }
        if (page === "embed" && ytcenter.utils.inArray(loc.search.substring(1).split("&"), "autoplay=1")) {
            loc.search = loc.search.replace("autoplay=1", "ytcenter-autoplay=1");
        }
        if (page === "watch" && document && document.head && document.head.getElementsByTagName) {
            var links = document.head.getElementsByTagName("link");
            if (links && links.length > 0 && links[0] && links[0].className && links[0].className.indexOf("www-feather") === 0) {
                con.log("[Feather] Feather layout detected!");
                ytcenter.feather = true;
            }
        }

        if (ytcenter.feather) {
            /*var obj = uw && uw.yt || {},
             pobj = uw && uw.yt && uw.yt.player || {},
             app = ytcenter.utils.oldBind(function(id, config){
             ytcenter.player.setConfig(ytcenter.player.modifyConfig("watch", config));

             return oApp(id, ytcenter.player.getConfig());
             }),
             oApp = uw && uw.yt && uw.yt.player && uw.yt.player.Application || null;
             defineLockedProperty(pobj, "Application", ytcenter.utils.oldBind(function(o){
             con.log("[Feather] Setting Application.");
             oApp = o;
             }), ytcenter.utils.oldBind(function(){
             con.log("[Feather] Application has been requested.");
             return app;
             }));

             defineLockedProperty(obj, "player", ytcenter.utils.oldBind(function(o){
             var key;
             for (key in o) {
             if (o.hasOwnProperty(key)) {
             pobj[key] = o[key];
             }
             }
             }), ytcenter.utils.oldBind(function(){
             return pobj;
             }));

             defineLockedProperty(uw, "yt", ytcenter.utils.oldBind(function(o){
             var key;
             for (key in o) {
             if (o.hasOwnProperty(key)) {
             obj[key] = o[key];
             }
             }
             }), ytcenter.utils.oldBind(function(){
             return obj;
             }));*/

            ytcenter.cssElements.feather = ytcenter.utils.addCSS("feather", ytcenter.css.feather);
        }

        if (ytcenter.getPage() !== "embed") {
            ytcenter.cssElements.general = ytcenter.utils.addCSS("general", ytcenter.css.general);
            ytcenter.cssElements.flags = ytcenter.utils.addCSS("flags", ytcenter.css.flags);
            ytcenter.cssElements.html5player = ytcenter.utils.addCSS("html5player", ytcenter.css.html5player);
            ytcenter.cssElements.gridview = ytcenter.utils.addCSS("gridview", ytcenter.css.gridview);
            ytcenter.cssElements.images = ytcenter.utils.addCSS("images", ytcenter.css.images);
            ytcenter.cssElements.dialog = ytcenter.utils.addCSS("dialog", ytcenter.css.dialog);
            ytcenter.cssElements.scrollbar = ytcenter.utils.addCSS("scrollbar", ytcenter.css.scrollbar);
            ytcenter.cssElements.list = ytcenter.utils.addCSS("list", ytcenter.css.list);
            ytcenter.cssElements.confirmbox = ytcenter.utils.addCSS("confirmbox", ytcenter.css.confirmbox);
            ytcenter.cssElements.panel = ytcenter.utils.addCSS("panel", ytcenter.css.panel);
            ytcenter.cssElements.resize = ytcenter.utils.addCSS("resize", ytcenter.css.resize, ytcenter.settings.enableResize);
            ytcenter.cssElements.resizePanel = ytcenter.utils.addCSS("resizePanel", ytcenter.css.resizePanel);
            ytcenter.cssElements.modules = ytcenter.utils.addCSS("modules", ytcenter.css.modules);
            ytcenter.cssElements.settings = ytcenter.utils.addCSS("settings", ytcenter.css.settings);
            //ytcenter.cssElements.centering = ytcenter.utils.addCSS("centering", ytcenter.css.centering, false);

            ytcenter.cssElements.topbar = ytcenter.utils.addCSS("topbar", ytcenter.css.topbar);

            ytcenter.cssElements.player = ytcenter.utils.addCSS("player", ytcenter.css.player);

            ytcenter.cssElements.darkside = ytcenter.utils.addCSS("darkside", ytcenter.css.darkside);

            ytcenter.cssElements.elementFocus = ytcenter.utils.addCSS("element-focus", ytcenter.css.elementFocus, false);

            //ytcenter.cssElements.yonez = ytcenter.utils.addCSS("yonez", ytcenter.css.yonez, ytcenter.settings.yonezCleanYT);

            try {
                ytcenter.unsafe.openSettings = ytcenter.utils.oldBind(function(){
                    if (!ytcenter.settingsPanelDialog) ytcenter.settingsPanelDialog = ytcenter.settingsPanel.createDialog();
                    ytcenter.settingsPanelDialog.setVisibility(true);
                });
                ytcenter.unsafeCall("GM_registerMenuCommand", [ytcenter.language.getLocale("BUTTON_SETTINGS_LABEL")], ytcenter.unsafe.openSettings);
                /*if (typeof GM_registerMenuCommand === "function") {
                 GM_registerMenuCommand(ytcenter.language.getLocale("BUTTON_SETTINGS_LABEL"), ytcenter.unsafe.openSettings);
                 }*/
            } catch (e) {
                con.error(e);
            }

        } else {
            ytcenter.cssElements.embed = ytcenter.utils.addCSS("embed", ytcenter.css.embed);
        }

        /*****START OF SAVEAS AND BLOB IMPLEMENTATION*****/
        /* Blob.js
         * A Blob implementation.
         * 2013-06-20
         * 
         * By Eli Grey, http://eligrey.com
         * By Devin Samarin, https://github.com/eboyjr
         * License: X11/MIT
         *   See LICENSE.md
         */
        /*http://purl.eligrey.com/github/Blob.js/blob/master/Blob.js*/
        /* FileSaver.js
         * A saveAs() FileSaver implementation.
         * 2013-01-23
         *
         * By Eli Grey, http://eligrey.com
         * License: X11/MIT
         *   See LICENSE.md
         */
        /*http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js*/

        /* The reason this is obfuscated is because IE crashes when using IE7Pro to run @name@.
         * I think that it has something to do with the javascript parser IE7Pro are using.
         * The source code of the injected obfuscated part can be found on:
         * https://github.com/YePpHa/YouTubeCenter/tree/master/obfuscated/io.js
         * ------
         * Tool used: http://www.jsobfuscate.com/index.php
         * Encoding: Normal
         * Fast Decode: enabled
         * Special Characters disabled
         * ---
         * Result replaced \\ with \\\\ and " with \".
         */
        ytcenter.inject("eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c])}}return p}('v=v||{};v.R=v.R||{};(4(I,v){o{v.R.B=B}q(e){}8(J B!==\"4\"||J k===\"2c\")8(J B===\"4\"&&J K!==\"2c\")I.k=K;j v.R.B=(4(6){\"1W 2l\";d Z=(4(){d a=t;o{a=6.Z||6.2d||6.1A||6.17}q(e){o{a=6.2d||6.1A||6.17}q(e){o{a=6.1A||6.17}q(e){o{a=6.17}q(e){}}}}f a})()||(4(6){d 1l=4(P){f 2P.S.1r.T(P).2Q(/^\\\\[P\\\\s(.*)\\\\]$/)[1]},1n=4 Z(){g.7=[]},A=4(7,c,w){g.7=7;g.1F=7.p;g.c=c;g.w=w},1f=1n.S,19=A.S,1d=6.1d,1s=4(c){g.1I=g[g.l=c]},1v=(\"2m 2V 22 2n 2W \"+\"31 30 2Z\").1M(\" \"),1h=1v.p,H=6.k||6.K||6,1k=H.11,1i=H.1u,k=H,1a=6.1a,1b=6.1b,1z=6.1z,Y=6.Y;A.2b=19.2b=14;1C(1h--){1s.S[1v[1h]]=1h+1}8(!H.11){k=6.k={}}k.11=4(b){d c=b.c,N;8(c===Q){c=\"2q/2z-2t\"}8(b 1c A){N=\"7:\"+c;8(b.w===\"1g\"){f N+\";1g,\"+b.7}j 8(b.w===\"2h\"){f N+\",\"+2i(b.7)}8(1a){f N+\";1g,\"+1a(b.7)}j{f N+\",\"+2o(b.7)}}j 8(1k){f 1k.T(H,b)}};k.1u=4(1m){8(1m.2D(0,5)!==\"7:\"&&1i){1i.T(H,1m)}};1f.1X=4(7){d E=g.7;8(Y&&(7 1c 1z||7 1c Y)){d 1q=\"\",1o=C Y(7),i=0,29=1o.p;20(;i<29;i++){1q+=2H.2M(1o[i])}E.x(1q)}j 8(1l(7)===\"B\"||1l(7)===\"2K\"){8(1d){d 2g=C 1d;E.x(2g.32(7))}j{2r C 1s(\"2n\")}}j 8(7 1c A){8(7.w===\"1g\"&&1b){E.x(1b(7.7))}j 8(7.w===\"2h\"){E.x(2i(7.7))}j 8(7.w===\"21\"){E.x(7.7)}}j{8(J 7!==\"2u\"){7+=\"\"}E.x(3r(2o(7)))}};1f.1U=4(c){8(!1w.p){c=Q}f C A(g.7.3i(\"\"),c,\"21\")};1f.1r=4(){f\"[P Z]\"};19.L=4(1Y,1T,c){d 1t=1w.p;8(1t<3){c=Q}f C A(g.7.L(1Y,1t>1?1T:g.7.p),c,g.w)};19.1r=4(){f\"[P B]\"};f 1n}(6));f 4(12,1x){d c=1x?(1x.c||\"\"):\"\";d 1y=C Z();8(12){20(d i=0,23=12.p;i<23;i++){1y.1X(12[i])}}f 1y.1U(c)}}(I));v.R.13=(I&&I.13)||(18&&18.1V&&18.1V.2B(18))||(4(6){\"1W 2l\";d 1B=6.3n,1p=4(){d a;o{a=6.k||6.K||6}q(e){o{a=6.k||6.K||6}q(e){o{a=6.K||6}q(e){o{a=6}q(e){}}}}f a},k=1p(),10=1B.3m(\"3k://3a.2I.3d/3e/3h\",\"a\"),2w=!6.3g&&\"V\"3b 10,1Q=4(2s){d n=1B.34(\"36\");n.37(\"1Q\",14,t,6,0,0,0,0,0,t,t,t,t,0,Q);2s.38(n)},16=6.3j,1E=6.3s||16||6.3p,2x=4(F){(6.3q||6.3l)(4(){2r F},0)},15=\"2q/2z-2t\",1H=0,M=[],2e=4(){d i=M.p;1C(i--){d r=M[i];8(J r===\"2u\"){k.1u(r)}j{r.26()}}M.p=0},1e=4(9,U,n){U=[].33(U);d i=U.p;1C(i--){d 1j=9[\"1L\"+U[i]];8(J 1j===\"4\"){o{1j.T(9,n||9)}q(F){2x(F)}}}},1G=4(b,l){d 9=g,c=b.c,1O=t,m,W,1P=4(){d m=1p().11(b);M.x(m);f m},1S=4(){1e(9,\"1Z 25 1K 24\".1M(\" \"))},y=4(){8(1O||!m){m=1P(b)}8(W){W.2p.1N=m}j{2O.2X(m,\"2S\")}9.u=9.G;1S()},z=4(2v){f 4(){8(9.u!==9.G){f 2v.2T(g,1w)}}},1R={2k:14,3c:t},L;9.u=9.2f;8(!l){l=\"V\"}8(2w){m=1P(b);10.1N=m;10.V=l;1Q(10);9.u=9.G;1S();f}8(6.2G&&c&&c!==15){L=b.L||b.2L;b=L.T(b,0,b.1F,15);1O=14}8(16&&l!==\"V\"){l+=\".V\"}8(c===15||16){W=6}8(!1E){y();f}1H+=b.1F;1E(6.2J,1H,z(4(2y){2y.2U.2N(\"3o\",1R,z(4(1J){d 1D=4(){1J.2j(l,1R,z(4(r){r.39(z(4(D){D.2a=4(n){W.2p.1N=r.3f();M.x(r);9.u=9.G;1e(9,\"24\",n)};D.27=4(){d X=D.X;8(X.1I!==X.22){y()}};\"1Z 25 1K O\".1M(\" \").35(4(n){D[\"1L\"+n]=9[\"1L\"+n]});D.1K(b);9.O=4(){D.O();9.u=9.G};9.u=9.28}),y)}),y)};1J.2j(l,{2k:t},z(4(r){r.26();1D()}),z(4(F){8(F.1I===F.2m){1D()}j{y()}}))}),y)}),y)},h=1G.S,13=4(b,l){f C 1G(b,l)};h.O=4(){d 9=g;9.u=9.G;1e(9,\"O\")};h.u=h.2f=0;h.28=1;h.G=2;h.X=h.2A=h.2C=h.2F=h.2E=h.27=h.2a=Q;6.2Y(\"2R\",2e,t);f 13}(I))})(I,v);',62,215,'||||function||view|data|if|filesaver||blob|type|var||return|this|FS_proto||else|URL|name|object_url|event|try|length|catch|file||false|readyState|ytcenter|encoding|push|fs_error|abortable|FakeBlob|Blob|new|writer|bb|ex|DONE|real_URL|self|typeof|webkitURL|slice|deletion_queue|data_URI_header|abort|object|null|io|prototype|call|event_types|download|target_view|error|Uint8Array|BlobBuilder|save_link|createObjectURL|blobParts|saveAs|true|force_saveable_type|webkit_req_fs|MSBlobBuilder|navigator|FB_proto|btoa|atob|instanceof|FileReaderSync|dispatch|FBB_proto|base64|file_ex_code|real_revoke_object_URL|listener|real_create_object_URL|get_class|object_URL|FakeBlobBuilder|buf|get_URL|str|toString|FileException|args|revokeObjectURL|file_ex_codes|arguments|options|builder|ArrayBuffer|MozBlobBuilder|doc|while|save|req_fs|size|FileSaver|fs_min_size|code|dir|write|on|split|href|blob_changed|get_object_url|click|create_if_not_found|dispatch_all|end|getBlob|msSaveOrOpenBlob|use|append|start|writestart|for|raw|ABORT_ERR|len|writeend|progress|remove|onerror|WRITING|buf_len|onwriteend|fake|undefined|WebKitBlobBuilder|process_deletion_queue|INIT|fr|URI|decodeURIComponent|getFile|create|strict|NOT_FOUND_ERR|NOT_READABLE_ERR|encodeURIComponent|location|application|throw|node|stream|string|func|can_use_save_link|throw_outside|fs|octet|onwritestart|bind|onprogress|substring|onabort|onwrite|chrome|String|w3|TEMPORARY|File|webkitSlice|fromCharCode|getDirectory|window|Object|match|unload|_blank|apply|root|SECURITY_ERR|ENCODING_ERR|open|addEventListener|SYNTAX_ERR|INVALID_STATE_ERR|NO_MODIFICATION_ALLOWED_ERR|readAsBinaryString|concat|createEvent|forEach|MouseEvents|initMouseEvent|dispatchEvent|createWriter|www|in|exclusive|org|1999|toURL|externalHost|xhtml|join|webkitRequestFileSystem|http|setTimeout|createElementNS|document|saved|mozRequestFileSystem|setImmediate|unescape|requestFileSystem'.split('|'),0,{}))");
        /*****END OF SAVEAS AND BLOB IMPLEMENTATION*****/
    });
    ytcenter.pageReadinessListener.addEventListener("bodyInitialized", function(page){
        if (ytcenter.feather) {
            var dir = document.body.getAttribute("dir");
            ytcenter.utils.addClass(document.body, dir);

            ytcenter.ltr = (dir === "ltr");

            /*** Add a separate section for this!
             ytcenter.utils.live.add("click", "button.yt-uix-button", function(e){
            var el = null,
              i;
            for (i = 0; i < this.children.length; i++) {
              if (this.children[i].className.indexOf("yt-uix-button-menu") !== -1) {
                el = this.children[i];
                break;
              }
            }
            
          });*/
        } else if (!ytcenter.utils.hasClass(document.body, "ltr")) {
            ytcenter.ltr = false;
        }
        if (page === "comments") return; // We don't need to do anything here.
        if (page === "embed" && !ytcenter.settings.embed_enabled) return;

        ytcenter.mutation.observe(document.getElementById("page"), { attributes: true }, ytcenter.player._updateResize);

        if (ytcenter._config_registered) {
            // Re-creating the player to ensure that the correct fexp is applied correctly.
            if (uw && uw.yt && uw.yt.player && uw.yt.player.Application && typeof uw.yt.player.Application.create === "function") {
                ytcenter.player.setConfig(ytcenter.player.modifyConfig(page, ytcenter.player.getConfig()));
                ytcenter.html5Fix.load();
            }
        }

        ytcenter.classManagement.applyClassesForElement(document.body);

        if (loc.href.indexOf(".youtube.com/embed/") === -1) {
            ytcenter.utils.live.add("click", "body.ytcenter-gridview #feed .feed-container button.feed-load-more", ytcenter.gridview.delayedUpdate);
            if (!ytcenter.welcome.hasBeenLaunched())
                ytcenter.welcome.setVisibility(true);
        }

        ytcenter.player.shortcuts();

        if (document.getElementById("page")
            && ytcenter.utils.hasClass(document.getElementById("page"), "channel")
            && document.getElementById("content")
            && document.getElementById("content").children.length > 0
            && ytcenter.utils.hasClass(document.getElementById("content").children[0], "branded-page-v2-container")
            && ytcenter.utils.hasClass(document.getElementById("content").children[0], "branded-page-v2-flex-width")) {
            document.body.className += " ytcenter-channelv2";
        }
    });

    /*> page_setup.js */

    ytcenter.pageReadinessListener.addEventListener("bodyInteractive", function(){
        var page = ytcenter.getPage();
        if (page === "embed" && !ytcenter.settings.embed_enabled) return;

        /* Only need to handle the Google+ comments */
        if (page === "comments") {
            var widgetBounds = document.getElementById("widget_bounds");
            if (widgetBounds) {
                widgetBounds.style.width = ((document.body.clientWidth || document.body.offsetWidth || document.body.scrollWidth) - 1) + "px";
            }

            ytcenter.commentsPlus.setup();
            return;
        } else if (page === "watch" || page === "all_comments") {
            ytcenter.commentsPlus.setup();
        }
        ytcenter.spf.setEnabled(ytcenter.settings.ytspf);

        /** YT Logo - Doodle Edition **/
        if (ytcenter.settings.useStaticLogo) {
            var logoContainer = document.getElementById("logo-container");
            if (logoContainer) {
                var parent = logoContainer.parentNode;
                var doodleMap = logoContainer.getElementsByTagName("map");

                if (ytcenter.utils.hasClass(logoContainer, "doodle")) {
                    ytcenter.utils.removeClass(logoContainer, "doodle");
                    ytcenter.utils.removeClass(parent, "doodle");

                    if (doodleMap && doodleMap.length > 0 && doodleMap[0] && doodleMap[0].parentNode) {
                        doodleMap[0].parentNode.removeChild(doodleMap[0]);
                    }

                    var logoContainerA = document.createElement("a");
                    logoContainerA.setAttribute("id", logoContainer.getAttribute("id"));
                    logoContainerA.className = logoContainer.className;
                    logoContainerA.setAttribute("href", "/");

                    var children = ytcenter.utils.toArray(logoContainer.children);
                    for (var i = 0, len = children.length; i < len; i++) {
                        logoContainer.removeChild(children[i]);
                        logoContainerA.appendChild(children[i]);
                    }

                    logoContainer.parentNode.replaceChild(logoContainerA, logoContainer);

                    logoContainer = logoContainerA;

                    var logo = document.getElementById("logo");
                    logo.removeAttribute("usemap");
                    logo.removeAttribute("style");

                    ytcenter.utils.addClass(document.body, "static-yt-logo");
                    ytcenter.utils.addClass(logoContainer, "doodle-removed");
                }
            } else {
                ytcenter.utils.removeClass(document.body, "static-yt-logo");
            }
        }
        ytcenter.updateLogoLink();

        ytcenter.unsafe.subtitles = ytcenter.subtitles;
        ytcenter.pageSetup();

        yt = uw.yt;

        if (page === "embed") {
            ytcenter.player.listeners.setup();
        }

        ytcenter.player.onYouTubePlayerReadyCalled = false;
        ytcenter.player.onYouTubePlayerReady = function(api){
            if (!ytcenter.player.config) return;
            /* Running other onYouTubePlayerReady callbacks */
            if (ytcenter.onYouTubePlayerReady) {
                var i;
                for (i = 0; i < ytcenter.onYouTubePlayerReady.length; i++) {
                    ytcenter.onYouTubePlayerReady[i].apply(uw, arguments);
                }
                ytcenter.onYouTubePlayerReady = [];
            }

            ytcenter.classManagement.applyClassesForElement();
            if (typeof api === "object") {
                ytcenter.player.onYouTubePlayerReadyCalled = true;
                ytcenter.player.__getAPI = api;

                api = ytcenter.player.getAPI();
                ytcenter.html5 = (api && typeof api.getPlayerType === "function" && api.getPlayerType() === "html5" && !ytcenter.player.isLiveStream() && !ytcenter.player.isOnDemandStream());
                ytcenter.player._update_onYouTubeReady = true;
                if (!ytcenter.html5) {
                    if (uw && uw.yt && uw.yt.player && uw.yt.player.utils &&
                        uw.yt.player.utils.VideoTagPool && uw.yt.player.utils.VideoTagPool.instance_
                        && uw.yt.player.utils.VideoTagPool.instance_.g && ytcenter.utils.isArray(uw.yt.player.utils.VideoTagPool.instance_.g)) {
                        for (var i = 0, len = uw.yt.player.utils.VideoTagPool.instance_.g.length; i < len; i++) {
                            yt.player.utils.VideoTagPool.instance_.g[i].src = "";
                            yt.player.utils.VideoTagPool.instance_.g[i].pause && yt.player.utils.VideoTagPool.instance_.g[i].pause();
                            if (yt.player.utils.VideoTagPool.instance_.g[i].parentNode) {
                                yt.player.utils.VideoTagPool.instance_.g[i].parentNode.removeChild(yt.player.utils.VideoTagPool.instance_.g[i]);
                            }
                            uw.yt.player.utils.VideoTagPool.instance_.g.splice(i, 1);
                            i--; len--;
                        }
                    }
                }

                ytcenter.player.listeners.dispose();
                ytcenter.player.listeners.setup();

                if (ytcenter.getPage() === "channel") {
                    if (ytcenter.player.config && ytcenter.player.config.args) {
                        ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
                    } else {
                        ytcenter.player.config.updateConfig = true;
                    }
                } else {
                    if (ytcenter.getPage() === "watch") {
                        if (ytcenter.player.config) {
                            try {
                                ytcenter.player.updateConfig(loc.href, ytcenter.player.modifyConfig(ytcenter.getPage(loc.href), ytcenter.player.config));
                                ytcenter.videoHistory.addVideo(ytcenter.player.config.args.video_id);
                            } catch (e) {
                                con.error(e);
                            }
                        }

                        ytcenter.topScrollPlayer.setEnabled(ytcenter.settings.topScrollPlayerEnabled);
                    } else if (ytcenter.getPage() === "embed") {
                        var lis = function(state){
                            if (state === -1) return;
                            ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
                            if (state === 1 || state === 2 || state === 3) ytcenter.player.listeners.removeEventListener("onStateChange", lis);
                        };
                        ytcenter.player.listeners.addEventListener("onStateChange", lis);
                        ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
                    }
                    ytcenter.tabEvents.addEventListener("player", function(playerFunction){
                        var api = ytcenter.player.getAPI();
                        if (!api && api[playerFunction]) {
                            con.error("[Tab Events] Player API \"" + playerFunction + "\" not found!");
                        } else {
                            api[playerFunction].apply(api, Array.prototype.slice.call(arguments, 1));
                        }
                    });
                    con.log("[onYouTubePlayerReady] => updateConfig");
                    ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
                    ytcenter.classManagement.applyClasses();
                }
            }
        };
        ytcenter.hideHeaderWhenPlayerPlaying.init();
        var apiChangedEnabled = true;
        ytcenter.player.listeners.addEventListener("onApiChange", function(){
            /*if (!apiChangedEnabled) {
             ytcenter.player.updateConfig(ytcenter.getPage(), ytcenter.player.config);
             apiChangedEnabled = true;
             }
             var api = ytcenter.player.getAPI();
             if (api && api.getUpdatedConfigurationData) {
             var newData = api.getUpdatedConfigurationData();
             con.log(newData);
             ytcenter.player.setConfig(ytcenter.player.modifyConfig(ytcenter.getPage(), newData));

             apiChangedEnabled = false;

             var cfg = ytcenter.player.config;
             con.log(cfg);

             if (ytcenter.topScrollPlayer.isActive()) {
             ytcenter.topScrollPlayer.setRedirectURL("/watch?v=" + encodeURIComponent(cfg.args.video_id) + "&list=" + encodeURIComponent(cfg.args.list));
             }

             if (api.loadNewVideoConfig) {
             api.loadNewVideoConfig(cfg);
             } else if (api.loadVideoByPlayerVars) {
             api.loadVideoByPlayerVars(cfg.args);
             }
             }*/
        });
        ytcenter.player.listeners.addEventListener("onReady", function(api){
            ytcenter.html5PlayWrapper.setReady(true);

            var config = ytcenter.player.getConfig();
            if (ytcenter.player.isAutoResolutionEnabled()) {
                ytcenter.player.setQuality(ytcenter.player.getQuality(ytcenter.settings.autoVideoQuality, ytcenter.video.streams, (config.args.dash === "1" && config.args.adaptive_fmts ? true : false)));
            }
        });
        ytcenter.unsafe.player = ytcenter.unsafe.player || {};
        ytcenter.unsafe.player.setAspect = ytcenter.player.aspect;
        ytcenter.unsafe.player.getAPI = ytcenter.utils.oldBind(ytcenter.player.getAPI, ytcenter.unsafe);
        ytcenter.unsafe.player.onReady = ytcenter.utils.oldBind(ytcenter.player.onYouTubePlayerReady, ytcenter.unsafe);
        ytcenter.unsafe.player.parseThumbnailStream = ytcenter.player.parseThumbnailStream;
        ytcenter.unsafe.player.showMeMyThumbnailStream = function(index){
            var a = ytcenter.player.parseThumbnailStream(ytcenter.player.config.args.storyboard_spec),
                b = a.levels[(typeof index === "number" && index > 0 && index < a.levels.length ? index : a.levels.length) - 1],
                elm = document.createElement("div"),
                pic = document.createElement("div"),
                box = {width: 1280, height: 720},
                rect = b.getRect(0, box),
                i = 0;
            pic.style.width = rect.width + "px";
            pic.style.height = rect.height + "px";

            pic.style.backgroundImage = "URL(" + b.getURL(0) + ")";
            pic.style.backgroundSize = rect.imageWidth + "px " + rect.imageHeight + "px";
            pic.style.backgroundPosition = rect.x + "px " + -rect.y + "px";
            ytcenter.utils.addEventListener(document.body, "keyup", function(e){
                if (e.keyCode === 37) {
                    i--;
                } else if (e.keyCode === 39) {
                    i++;
                }
                if (b.frames <= i) i = 0;
                if (i < 0) i = b.frames - 1;
                rect = b.getRect(i, box);
                pic.style.backgroundImage = "URL(" + b.getURL(i) + ")";
                pic.style.backgroundPosition = -rect.x + "px " + -rect.y + "px";
            }, false);

            elm.appendChild(pic);
            ytcenter.dialog(null, elm).setVisibility(true);
        };
        if (typeof uw.onYouTubePlayerReady === "function") {
            if (!ytcenter.onYouTubePlayerReady) ytcenter.onYouTubePlayerReady = [];
            ytcenter.onYouTubePlayerReady.push(uw.onYouTubePlayerReady);
        }
        defineLockedProperty(uw, "onYouTubePlayerReady", function(func){
            con.log("[onYouTubePlayerReady] Something is trying to set onYouTubePlayerReady to something else.");
            if (typeof func !== "function") return;
            if (!ytcenter.onYouTubePlayerReady) ytcenter.onYouTubePlayerReady = [];
            ytcenter.onYouTubePlayerReady.push(func);
        }, function(){
            return ytcenter.player.onYouTubePlayerReady;
        });

        /* bodyInteractive should only be used for the UI, use the other listeners for player configuration */
        ytcenter.player.listeners.addEventListener("onReady", function(){
            var api = null, state = null;
            if (ytcenter.player.getAPI) api = ytcenter.player.getAPI();
            if (api && api.getPlayerState) state = ytcenter.player.getAPI().getPlayerState();

            if (state === 1 && ytcenter.settings.playerOnlyOneInstancePlaying && !ytcenter.player.isPreventAutoBuffering() && !ytcenter.player.isPreventAutoPlay()) {
                if ((ytcenter.getPage() === "embed" && ytcenter.settings.embed_enabled) || ytcenter.getPage() !== "embed") {
                    ytcenter.player.network.pause();
                }
            }

            ytcenter.autoplayRecommendedVideo.update();
        });
        ytcenter.player.listeners.addEventListener("onStateChange", function(state){
            if (ytcenter.player.setPlaybackState.preferredState !== null) state = ytcenter.player.setPlaybackState.preferredState;

            if (state === 1 && ytcenter.settings.playerOnlyOneInstancePlaying) {
                if ((ytcenter.getPage() === "embed" && ytcenter.settings.embed_enabled) || ytcenter.getPage() !== "embed") {
                    ytcenter.player.network.pause();
                }
            }

            ytcenter.autoplayRecommendedVideo.update();
        });

        if (page === "embed") {
            /* I've moved ytcenter.embed.load to be executed when the page has completely loaded */
            //@embed
            return;
        }

        $CreateSettingsUI();
        $UpdateChecker();

        ytcenter.player.listeners.addEventListener("onAdStart", function(type){
            if (type === "PREROLL") {
                if (ytcenter.getPage() === "watch") {
                    if (ytcenter.playlist) {
                        if (ytcenter.settings.preventPlaylistAutoPlay) {
                            ytcenter.player.getAPI().mute();
                            ytcenter.player.getAPI().pauseVideo();
                            !ytcenter.settings.mute && ytcenter.player.getAPI().isMuted && ytcenter.player.getAPI().unMute();
                        }
                    } else {
                        if (ytcenter.settings.preventAutoPlay) {
                            ytcenter.player.getAPI().mute();
                            ytcenter.player.getAPI().pauseVideo();
                            !ytcenter.settings.mute && ytcenter.player.getAPI().isMuted && ytcenter.player.getAPI().unMute();
                        }
                    }
                } else if (ytcenter.getPage() === "channel") {
                    if (ytcenter.settings.channel_preventAutoPlay) {
                        ytcenter.player.getAPI().mute();
                        ytcenter.player.getAPI().pauseVideo();
                        !ytcenter.settings.channel_mute && ytcenter.player.getAPI().isMuted && ytcenter.player.getAPI().unMute();
                    }
                } else if (ytcenter.getPage() === "embed") {
                    if (ytcenter.settings.embed_preventAutoPlay) {
                        ytcenter.player.getAPI().mute();
                        ytcenter.player.getAPI().pauseVideo();
                        !ytcenter.settings.embed_mute && ytcenter.player.getAPI().isMuted && ytcenter.player.getAPI().unMute();
                    }
                }
            }
        });
        ytcenter.player.listeners.addEventListener("onReady", function(){
            var api, state;
            if (ytcenter.player.getAPI) api = ytcenter.player.getAPI();
            if (api && api.getPlayerState) state = ytcenter.player.getAPI().getPlayerState();
            if (state === 3) state = -1;
            if (state === 1) {
                ytcenter.title.addPlayIcon();
            } else {
                ytcenter.title.removePlayIcon();
            }
            ytcenter.title.update();

            ytcenter.html5PlayWrapper.setReady(true);
            ytcenter.player.fixThumbnailOverlay(state);
        });

        var tmpFixRepeatAtEnd = false;
        ytcenter.player.listeners.addEventListener("onStateChange", function(state, b) {
            ytcenter.player.fixThumbnailOverlay(state);

            if (state === 1) {
                ytcenter.title.addPlayIcon();
            } else {
                ytcenter.title.removePlayIcon();
            }
            ytcenter.title.update();

            if (ytcenter.doRepeat && ytcenter.settings.enableRepeat && state === 0) {
                if (ytcenter.settings.tempFixRepeat) {
                    ytcenter.player.getAPI().stopVideo();
                }
                ytcenter.player.getAPI().playVideo();
            }

            if (ytcenter.settings.endOfVideoAutoSwitchToTab !== "none" && state === 0) {
                if (ytcenter.settings.endOfVideoAutoSwitchToTab === "mysubscriptions") {
                    var url = "/feed/subscriptions";

                    var api = ytcenter.player.getAPI();
                    ytcenter.html5PlayWrapper.setForcedPause(true);
                    api.seekTo && api.seekTo(0);
                    api.pauseVideo && api.pauseVideo();

                    setTimeout(function(){
                        // Checking if SPF navigate is defined
                        if (uw && uw.spf && uw.spf.navigate) {
                            uw.spf.navigate(url);
                        } else {
                            loc.href = url;
                        }
                    }, 7);
                } else {
                    ytcenter.actionPanel.switchTo(ytcenter.settings.endOfVideoAutoSwitchToTab);
                }
            }
        });
        ytcenter.player.listeners.setOverride("SIZE_CLICKED", true);
        ytcenter.player.listeners.addEventListener("SIZE_CLICKED", function(large){
            function getSizeById(id) {
                var sizes = ytcenter.settings["resize-playersizes"];
                for (var i = 0; i < sizes.length; i++) {
                    if (id === sizes[i].id) {
                        return sizes[i];
                    }
                }
                return {
                    id: "default",
                    config: {
                        align: true,
                        height: "",
                        large: false,
                        scrollToPlayer: false,
                        scrollToPlayerButton: false,
                        width: ""
                    }
                };
            }
            if (ytcenter.settings.enableResize) {
                con.log("[Player Resize] Setting to " + (large ? "large" : "small") + "!");
                if (large) {
                    ytcenter.player.setPlayerWide(true);

                    ytcenter.player.currentResizeId = ytcenter.settings['resize-large-button'];
                    ytcenter.player.updateResize();
                } else {
                    ytcenter.player.setPlayerWide(false);

                    ytcenter.player.currentResizeId = ytcenter.settings['resize-small-button'];
                    ytcenter.player.updateResize();
                }
            } else {
                this.getOriginalListener()(large);
            }
        });

        /*if (ytcenter.feather) {
         var flashvars = document.getElementById("movie_player").getAttribute("flashvars").split("&"),
         args, i;
         for (i = 0; i < flashvars.length; i++) {
         args[decodeURIComponent(flashvars.split("=")[0])] = decodeURIComponent(flashvars.split("=")[0]);
         ytcenter.player.setConfig({args: args});
         }
         }*/

        if (loc.hash === "#ytcenter.settings.open") {
            ytcenter.unsafe.openSettings();
        }
    });
    ytcenter.pageReadinessListener.addEventListener("bodyComplete", function(page){
        if (page === "embed" && !ytcenter.settings.embed_enabled) return;
        if (page === "comments") {
            ytcenter.domEvents.ready();
        }
        if (page === "embed") {
            ytcenter.embed.load();
        } else {
            ytcenter.guideMode.setup();
        }

        ytcenter.spf.setEnabled(ytcenter.settings.ytspf);

        if (page !== "watch" && page !== "embed" && page !== "comments") {
            ytcenter.player.update();
        }

        ytcenter.autoplayRecommendedVideo.update();

        ytcenter.classManagement.applyClassesForElement(document.body);

        uw.yt && uw.yt.pubsub && typeof uw.yt.pubsub.publish === "function" && uw.yt.pubsub.publish("page-scroll"); // Let's trigger the scroll event for YouTube.

        if (loc.hash === "#ytcenter.settings.open") {
            loc.hash = "#!";
        }
    });

    ytcenter.spf.addEventListener("request", function(e) {
        var detail = e.detail;
        ytcenter.reportIssue.resetGistURL();
        ytcenter.player.setConfig(null);
        ytcenter.html5PlayWrapper.setReady(false, true);
        ytcenter.descriptionTags.destroy();
    });
    ytcenter.spf.addEventListener("process", function(e) {
        var detail = e.detail;

        ytcenter.html5PlayWrapper.setForcedPause(false);

        if (detail && detail.response && detail.response.title) {
            ytcenter.title.originalTitle = detail.response.title;
            ytcenter.title.update();
        }
    });
    ytcenter.spf.addEventListener("partprocess", function(e) {
        var detail = e.detail;

        ytcenter.html5PlayWrapper.setForcedPause(false);

        var url = detail.url;
        if (detail && detail.part) {
            var part = detail.part;
            if (part.title) {
                ytcenter.title.originalTitle = part.title;
                ytcenter.title.update();
            }
            var swfcfg = null;
            if (part.swfcfg) {
                swfcfg = part.swfcfg;
            } else if (part.data && part.data.swfcfg) {
                swfcfg = part.data.swfcfg;
            }
            if (swfcfg) {
                swfcfg = ytcenter.player.modifyConfig(ytcenter.getPage(url), swfcfg);
                ytcenter.player.setConfig(swfcfg);

                if (swfcfg.args && swfcfg.args.video_id) {
                    ytcenter.videoHistory.addVideo(swfcfg.args.video_id);
                }
            }
            if (part.attr && part.attr.body && part.attr.body.class) {
                part.attr.body.class += " " + ytcenter.classManagement.getClassesForElementByTagName("body", url);
            }
        }
    });

    ytcenter.spf.addEventListener("done", function(e) {
        var detail = e.detail;

        ytcenter.html5PlayWrapper.setForcedPause(false);

        var url = detail.url;

        ytcenter.classManagement.applyClasses(url);

        ytcenter.pageSetup();

        /* Removing leftover tooltips */
        var a = ytcenter.utils.transformToArray(document.getElementsByClassName("yt-uix-tooltip-tip"));
        for (var i = 0; i < a.length; i++) {
            if (a[i] && a[i].parentNode === document.body) {
                con.log("[Tooltip Cleanup] Removed tooltip with id #" + a[i].id.replace("yt-uix-tooltip", ""));
                document.body.removeChild(a[i]);
            }
        }

        /*if (ytcenter.player.getConfig() !== null) {
         setTimeout(function(){
         con.debug("[IssueTmpFix] Player not loading correct video.");
         var api = ytcenter.player.getAPI();
         api.loadVideoByPlayerVars(ytcenter.player.getConfig().args);
         ytcenter.player.onYouTubePlayerReady(api);
         }, 1000);
         }*/
    });

    ytcenter.pageReadinessListener.setup();
})();