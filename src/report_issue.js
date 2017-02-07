/* Issue reporter. Hosts a settings template and several functions that compose
   information for an issue report (likely separate from rest of settings for that
   reason) */

ytcenter.reportIssue = (function(){
    function createSettingsCategory() {
        cat = ytcenter.settingsPanel.createCategory("SETTINGS_CAT_REPORT");

        createInstructions();
        createIssueTemplate();
    }

    function createInstructions() {
        var instructions = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_INSTRUCTIONS");
        cat.addSubCategory(instructions);

        var instructionElement = document.createElement("div");
        instructionElement.textContent = "Coming soon.";



        var option = ytcenter.settingsPanel.createOption(
            null,
            "simpleElement",
            null,
            {
                "element": instructionElement
            }
        );
        instructions.addOption(option);
    }

    function createIssueTemplate() {
        browserDetails = getBrowserDetails();

        var template = ytcenter.settingsPanel.createSubCategory("SETTINGS_SUBCAT_ISSUE_TEMPLATE");
        cat.addSubCategory(template);

        var tempElement = document.createElement("div");

        template.addEventListener("click", function(){
            generateTemplateElement(tempElement);
        });

        tempElement.addEventListener("copy", function(){
            var selection = window.getSelection();
            var selectionRange = null;
            if (selection.getRangeAt && selection.rangeCount) {
                selectionRange = selection.getRangeAt(0);
            }

            var clonedTemplate = tempElement.cloneNode(true);
            clonedTemplate.className = "ytc-copying";

            var titles = clonedTemplate.getElementsByClassName("title");
            for (var i = 0, len = titles.length; i < len; i++) {
                titles[i].textContent = "__" + titles[i].textContent + "__";
            }

            document.body.appendChild(clonedTemplate);
            selection.selectAllChildren(clonedTemplate);

            ytcenter.settingsPanel.statusbar.setMessage("Copied", 1500); // TODO  Use translated locale

            setTimeout(function(){
                selection.removeAllRanges();
                selection.addRange(selectionRange);

                clonedTemplate.parentNode.removeChild(clonedTemplate);
            }, 7);
        });

        //generateTemplateElement(tempElement);

        var option = ytcenter.settingsPanel.createOption(
            null,
            "simpleElement",
            null,
            {
                "element": tempElement
            }
        );
        template.addOption(option);
    }

    function generateTemplateElement(tempElement) {
        tempElement.innerHTML = "";
        var list = document.createElement("ul");
        for (var i = 0, len = templateList.length; i < len; i++) {
            var listItem = templateList[i];
            var generatedContent = listItem.value();
            if (listItem.emptyHide && generatedContent === "") continue;

            var item = document.createElement("li");
            var title = document.createElement("span");
            title.className = "title";
            title.style.fontWeight = "bold";
            title.textContent = listItem.title;

            item.appendChild(title);

            var split = document.createElement("span");
            split.textContent = ":" + (listItem.addLines ? "" : " ");
            item.appendChild(split);

            var content = null;

            if (listItem.wrapper) {
                contentGist = contentGist || document.createElement("span");
                contentGist.innerHTML = "";

                if (!uploadLink) {
                    uploadLink = document.createElement("a");
                    uploadLink.textContent = "Upload";
                    uploadLink.setAttribute("href", "#");
                    uploadLink.addEventListener("click", function(e){
                        e = e || window.event;

                        contentGist.textContent = "Uploading...";
                        contentGist.style.fontStyle = "italic";

                        var data = {
                            "description": null,
                            "public": false,
                            "files": {
                                "debug_log.js": {
                                    "content": JSON.stringify(ytcenter.getDebug(false), undefined, 2)
                                }
                            }
                        };
                        ytcenter.utils.xhr({
                            method: "POST",
                            url: "https://api.github.com/gists",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            data: JSON.stringify(data),
                            contentType: "application/x-www-form-urlencoded", // Firefox Addon
                            content: JSON.stringify(data), // Firefox Addon
                            onload: (function(contentGist){
                                return function(response) {
                                    var details = JSON.parse(response.responseText);
                                    gistURL = details.html_url;

                                    var link = document.createElement("a");
                                    link.href = gistURL;
                                    link.textContent = gistURL;

                                    contentGist.innerHTML = "";
                                    contentGist.style.fontStyle = "";
                                    contentGist.appendChild(link);
                                };
                            })(contentGist)
                        });

                        e && e.preventDefault && e.preventDefault();
                        return false;
                    }, false);
                }
                if (!orSpan) {
                    orSpan = document.createElement("span");
                    orSpan.textContent = " or ";
                }
                if (!useExistingLink) {
                    useExistingLink = document.createElement("a");
                    useExistingLink.textContent = "use last Gist";
                    useExistingLink.setAttribute("href", "#");

                    useExistingLink.addEventListener("click", function(e){
                        e = e || window.event;

                        var link = document.createElement("a");
                        link.href = gistURL;
                        link.textContent = gistURL;

                        contentGist.innerHTML = "";
                        contentGist.appendChild(link);

                        e && e.preventDefault && e.preventDefault();
                        return false;
                    }, false);
                }

                //contentGist.appendChild(uploadLink);
                if (gistURL) {
                    //contentGist.appendChild(orSpan);
                    //contentGist.appendChild(useExistingLink);
                    var link = document.createElement("a");
                    link.href = gistURL;
                    link.textContent = gistURL;

                    contentGist.appendChild(link);
                } else {
                    contentGist.appendChild(uploadLink);

                }

                item.appendChild(contentGist);

                content = contentGist;
            } else {
                content = document.createElement("span");
                content.textContent = generatedContent;
            }
            item.appendChild(content);

            if (listItem.addSpace) {
                item.appendChild(document.createElement("br"));
                item.appendChild(document.createElement("br"));
            }

            if (listItem.addLines) {
                item.appendChild(document.createElement("br"));
                item.appendChild(document.createElement("br"));
                item.appendChild(document.createElement("br"));
            }

            list.appendChild(item);
        }

        tempElement.appendChild(list);
    }

    function getBrowserDetails() {
        var parser = new ytcenter.UAParser();
        var results = parser.getResult();

        return results;
    }

    function getBrowserName() {
        return browserDetails.browser.name;
    }

    function getBrowserVersion() {
        return browserDetails.browser.version;
    }

    function getBrowserEngine() {
        return browserDetails.engine.name;
    }

    function getOS() {
        var name = browserDetails.os.name;
        var version = browserDetails.os.version;

        var returns = "";

        if (name) {
            returns += name;
            if (version) {
                returns += " " + version;
            }
        }
        return returns;
    }

    function getYTCVersion() {
        if (devbuild) {
            return "Developer Version - Build #" + devnumber;
        } else {
            return ytcenter.version;
        }
    }

    function getAddonType() {
        switch (identifier) {
            case 0:
                return "Userscript";
            case 1:
                return "Chrome extension";
            case 2:
                return "Maxthon extension";
            case 3:
                return "Opera extension";
            case 4:
                return "Firefox addon";
            case 5:
                return "Userscript; Scriptish version";
            case 6:
                return "Chrome extension; Webstore edition";
            default:
                return "";
        }
    }

    function emptyTemplate() {
        return "";
    }

    function getDebugLog() {
        return "```JavaScript\n" + JSON.stringify(ytcenter.getDebug(false), undefined, 2) + "\n```";
    }

    var cat = null;
    var browserDetails = null;
    var gistURL = null;

    // Gist URL action elements
    var contentGist = null;
    var uploadLink = null;
    var orSpan = null;
    var useExistingLink = null;

    var templateList = [
        { title: "Browser name", value: getBrowserName },
        { title: "Browser version", value: getBrowserVersion },
        { title: "Browser engine", value: getBrowserEngine, emptyHide: true },
        { title: "OS", value: getOS, emptyHide: true },
        { title: "YouTube Center version", value: getYTCVersion },
        { title: "Addon type", value: getAddonType },
        { title: "Debug log", value: getDebugLog, wrapper: "pre" },
        { title: "Issue description", value: emptyTemplate, addLines: true },
        { title: "How to reproduce the issue", value: emptyTemplate, addLines: true }
    ];

    var exports = {};
    exports.createSettingsCategory = createSettingsCategory;
    exports.resetGistURL = function(){ gistURL = null; };

    return exports;
})();