/* system for moving elements on a page with drag&drop (used for the buttons below the player) */
(function(global, propertyName){
    function getTargetedGroup(x, y, groups) {
        var distance = null;
        var heightGroup = null;

        for (var i = 0, len = groups.length; i < len; i++) {
            // Group element
            var group = groups[i];

            // Getting the absolute position of the group element
            var absolutePosition = utils.getAbsolutePosition(group);

            /*
             * The points on the rectangle, which represents the group element.
             * px is 1 and 2,
             * py is 1 and 3,
             * pWidth is 2 and 4,
             * pHeight is 3 and 4
             * 1------------2
             * |            |
             * |            |
             * 3------------4
             */
            var px = absolutePosition.x;
            var py = absolutePosition.y;
            var pWidth = absolutePosition.x + group.offsetWidth;
            var pHeight = absolutePosition.y + group.offsetHeight;

            // Detecting if the (x, y) point is inside or touches the group element (rectangle)
            if (x >= px && x <= pWidth && y >= py && y <= pHeight) {
                return group;
            } else if (y >= py && y <= pHeight) {
                var tmpDist = null;
                if (x < px) {
                    // Left side
                    tmpDist = px - x;
                } else if (x > pWidth) {
                    // Right side
                    tmpDist = x - pWidth;
                } else {
                    continue; // This should never happen.
                }
                if (distance === null || tmpDist < distance) {
                    heightGroup = group;
                    distance = tmpDist;
                }
            }
        }

        return heightGroup;
    }

    function getRelativeGroupChild(x, y, group) {
        // The cursor is inside a group element.
        if (group !== null) {
            var groupChildren = group.children;

            // Iterate through every child of group
            for (var i = 0, len = groupChildren.length; i < len; i++) {
                var child = groupChildren[i];
                // Making sure that an element is not placed beside itself.
                if (child !== refMoveableElement && child !== refTargetedElement) {
                    // Get the child's absolute position on the page
                    var absolutePosition = utils.getAbsolutePosition(child);

                    // The for loop iterates through the children chronological, which means that
                    // it only needs to look if the x-value of the cursor is before half of the
                    // child element.
                    if (x <= child.offsetWidth/2 + absolutePosition.x && y <= child.offsetHeight + absolutePosition.y) {
                        return child;
                    }
                }
            }
        }

        // No child was found, return null
        return null;
    }

    function mousemoveListener(e) {
        if (!mousedown || !moduleEnabled) return;
        e = e || window.event;

        // If user is using touch, make sure that it detects the touch instead of mouse.
        if (e && e.type.indexOf("touch") !== -1 && e.changedTouches && e.changedTouches.length > 0 && e.changedTouches[0]) {
            e = e.changedTouches[0];
        }

        // The (x, y) coordinate of the mouse cursor on the page
        var x = e.pageX;
        var y = e.pageY;

        // Update the moveable element position
        refMoveableElement.style.top = (y - (relativeMousePosition.y || 0)) + "px";
        refMoveableElement.style.left = (x - (relativeMousePosition.x || 0)) + "px";

        // Get the targeted group with the (x, y) coordinate of the cursor
        var group = getTargetedGroup(x, y, groupElements);

        if (group) {
            // Get the relative group child element
            var child = getRelativeGroupChild(x, y, group);

            // Make sure that targeted element does have a parent to remove
            // the element from
            if (refTargetedElement.parentNode) {
                refTargetedElement.parentNode.removeChild(refTargetedElement);
            }

            if (child) {
                // A child was found insert the targeted element before said child
                group.insertBefore(refTargetedElement, child);
            } else {
                // A child was not found just append the element to the group
                group.appendChild(refTargetedElement);
            }
        }

        // Prevent default action
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            window.event.returnValue = false;
        }
        return false;
    }

    function mousedownListener(e) {
        if (mousedown || !moduleEnabled) return;

        e = e || window.event;

        var targetedElement = e.target;
        while (targetedElement) {
            if (!targetedElement.parentNode) return; // Targeted element not in a container

            // Is the targeted element a child of groupElements
            // and if so then we break out of this loop
            if (utils.inArray(groupElements, targetedElement.parentNode)) {
                break;
            }

            // The desired element is a child to one of the containers.
            targetedElement = targetedElement.parentNode;
        }

        mousedown = true;

        // Relative position to targeted element
        var absolutePosition = utils.getAbsolutePosition(targetedElement);
        relativeMousePosition = {
            x: e.pageX - absolutePosition.x,
            y: e.pageY - absolutePosition.y
        };

        // Create the moveable element
        var moveableElement = createMoveableElement(targetedElement);

        // Make the targeted element invisible
        ytcenter.utils.addClass(targetedElement, "placementsystem-target");
        //targetedElement.style.visibility = "hidden";

        // Store two references for later use
        refMoveableElement = moveableElement;
        refTargetedElement = targetedElement;

        document.body.appendChild(moveableElement);

        // Add mouseup, mousemove, touchend and touchmove event listener
        utils.addEventListener(document, "mousemove", mousemoveListener, false);
        utils.addEventListener(document, "touchmove", mousemoveListener, false);

        // Prevent default action
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            window.event.returnValue = false;
        }
        return false;
    }

    function mouseupListener(e) {
        if (!mousedown || !moduleEnabled || !refTargetedElement) return;
        mousedown = false;

        e = e || window.event;

        // Make the targeted element visible
        ytcenter.utils.removeClass(refTargetedElement, "placementsystem-target");
        //refTargetedElement.style.visibility = "";

        // Remove the moveable element from the DOM
        refMoveableElement.parentNode.removeChild(refMoveableElement);

        // Remove relative mouse position
        relativeMousePosition = null;

        // Remove stored references
        refMoveableElement = null;
        refTargetedElement = null;

        // Remove mousemove and touchmove event listener
        utils.removeEventListener(document, "mousemove", mousemoveListener, false);
        utils.removeEventListener(document, "touchmove", mousemoveListener, false);

        // Prevent default action
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            window.event.returnValue = false;
        }
        return false;
    }

    function setGroupElements(groups) {
        groupElements = groups;
    }

    function setMoveableElementPosition(el, moveableElement) {
        var absolutePosition = utils.getAbsolutePosition(el);

        // Give the moveable an absolute position, which will be
        // on top of the original element.
        moveableElement.style.position = "absolute";
        moveableElement.style.top = absolutePosition.y + "px";
        moveableElement.style.left = absolutePosition.x + "px";
        moveableElement.style.zIndex = "1999999999999";
    }

    function createMoveableElement(el) {
        function removeTooltip(el) {
            // Removes tooltip from element
            el.title = "";
            el.setAttribute("data-button-action", "");
            el.setAttribute("data-tooltip-text", "");
            ytcenter.utils.removeClass(el, "yt-uix-tooltip");

            // Removes tooltip from children
            var children = el.children;
            for (var i = 0, len = children.length; i < len; i++) {
                removeTooltip(children[i]);
            }
        }
        var moveableElement = el.cloneNode(true);

        // Move the moveable element on top of the targeted element
        setMoveableElementPosition(el, moveableElement);

        // Removes tooltip from the moveable element
        removeTooltip(moveableElement);

        return moveableElement;
    }

    function setEnabled(enabled) {
        moduleEnabled = enabled;

        utils.removeEventListener(document, "mousemove", mousemoveListener, false);
        utils.removeEventListener(document, "touchmove", mousemoveListener, false);

        utils.removeEventListener(document, "mousedown", mousedownListener, false);
        utils.removeEventListener(document, "touchstart", mousedownListener, false);

        utils.removeEventListener(document, "mouseup", mouseupListener, false);
        utils.removeEventListener(document, "touchend", mouseupListener, false);

        if (enabled) {
            utils.addEventListener(document, "mousedown", mousedownListener, false);
            utils.addEventListener(document, "touchstart", mousedownListener, false);

            utils.addEventListener(document, "mouseup", mouseupListener, false);
            utils.addEventListener(document, "touchend", mouseupListener, false);
        }
    }

    // Reference to ytcenter.utils
    var utils = ytcenter.utils;

    /**
     * An array of where the moveable elements can be placed in.
     *
     * @property groupElements
     * @type HTMLElement[]
     **/
    var groupElements = [ ];

    // A reference to the moveable and targeted elements for use in mousemove
    var relativeMousePosition = null;
    var refMoveableElement = null;
    var refTargetedElement = null;

    // Properties
    var moduleEnabled = false;
    var mousedown = false;

    // Throttle the listener as it can be taxing for the users system.
    mousemoveListener = utils.throttle(mousemoveListener, 50);

    var exports = {};

    exports.setGroupElements = setGroupElements;
    exports.setEnabled = setEnabled;

    // Add mousedown, touchstart, mouseup and touchend event listener
    utils.addEventListener(document, "mousedown", mousedownListener, false);
    utils.addEventListener(document, "touchstart", mousedownListener, false);
    utils.addEventListener(document, "mouseup", mouseupListener, false);
    utils.addEventListener(document, "touchend", mouseupListener, false);

    global[propertyName] = exports;
})(ytcenter, "placementdragdrop");


/**
 * Dynamic element placement library
 **/
(function(global, propertyName){
    /**
     * Adding an element to a defined group.
     *
     * @param {String} id The id of the group.
     * @param {HTMLElement} element The element that will be added to the group.
     **/
    function addElement(id, elementId, element) {
        if (!groups[id]) throw "Group " + id + " has not been created!";
        groups[id].children.push({ id: elementId, element: element });

        // Append the element to the group element
        groups[id].element.appendChild(element);
    }

    /**
     * Creating a group.
     *
     * @param {String} id The id of the group.
     * @param {HTMLElement} element The group element.
     * @param {Object} options The options for the group.
     **/
    function createGroup(id, element, options) {
        if (groups[id]) throw "Group " + id + " has already been created!";
        groups[id] = {
            element: element, // The container element where the children resides
            options: options, // The options for that specific group
            children: []
        };
    }

    /**
     * Returns the unique ID for the given element.
     *
     * @param {HTMLElement} element The element to get the element from.
     * @return {String} The unique ID for the element.
     **/
    function getElementUniqueId(element) {
        var classes = utils.listClass(element);
        for (var i = 0, len = classes.length; i < len; i++) {
            if (classes[i] !== "") {
                classes[i] = encodeURIComponent(classes[i]);
            }
        }

        if (classes.length > 0) {
            classes = "." + classes.join(".");
            if (classes[classes.length - 1] === ".") {
                classes = classes.substring(0, classes.length - 1);
            }
        } else {
            classes = "";
        }

        var id = element.getAttribute("id");
        if (id) {
            id = "#" + encodeURIComponent(id);
        } else {
            id = "";
        }

        var tagName = encodeURIComponent(element.tagName);

        var uid = null;

        var parent = element.parentNode && element.parentNode instanceof HTMLElement;

        if (!id && !classes && parent) {
            var parentNode = element.parentNode;
            for (var i = 0, len = parentNode.children.length; i < len; i++) {
                if (parentNode.children[i] === element) {
                    uid = tagName + "[" + i + "]"
                    break;
                }
            }
        } else {
            uid = tagName + id + classes;
        }

        if (!id && parent) {
            return getElementUniqueId(element.parentNode) + " " + uid;
        } else {
            return uid;
        }
    }

    function getTransformation(id, classNames) {
        var transformations = [];
        transformations.push.apply(transformations, ytcenter.settings.placementTransformation);
        transformations.push.apply(transformations, transformation);

        for (var i = 0; i < transformations.length; i++) {
            var query = transformations[i].query;
            var transform = transformations[i].transform;
            if (query.id !== null && query.id !== id) {
                continue;
            }
            if (query.className !== null && !ytcenter.utils.arrayCompare(query.className, classNames)) {
                continue;
            }
            return transform;
        }

        return null;
    }

    /**
     * Returns the HTMLElement with a specific unique ID.
     *
     * @param {String} id The unique ID.
     * @return {HTMLElement} The element with the unique ID.
     **/
    function getElementByUniqueId(uid) {
        var tokens = uid.split(" ");
        var element = null;
        for (var i = 0, len = tokens.length; i < len; i++) {
            var match = /([a-zA-Z0-9_%\-]+)(\[[0-9]+\])?(\#[a-zA-Z0-9_%\-]+)?((\.[a-zA-Z0-9_%\-]+)*)/g.exec(tokens[i]);
            var tagName = decodeURIComponent(match[1]);
            var childIndex = null;
            if (match[2]) {
                childIndex = parseInt(match[2].substring(1, match[2].length - 1), 10);
            }
            var id = null;
            if (match[3]) {
                id = decodeURIComponent(match[3].substring(1));
            }

            var classes = [];
            if (match[4]) {
                classes = match[4].substring(1).split(".");
            }
            for (var j = 0, lenj = classes.length; j < lenj; j++) {
                classes[j] = decodeURIComponent(classes[j]);
            }

            var transformer = getTransformation(id, classes);
            if (transformer) {
                id = transformer.id;
                classes = transformer.className;
            }

            var doc = document;
            if (element) {
                doc = element;
            }
            var continues = false;
            if (id) {
                element = document.getElementById(id);
            } else if (classes.length > 0) {
                var elements = doc.getElementsByClassName(classes.join(" "));
                for (var j = 0, lenj = elements.length; j < lenj; j++) {
                    if (elements[j].tagName.toLowerCase() === tagName.toLowerCase()) {
                        element = elements[j];
                        continues = true;
                        break;
                    }
                }
                if (!continues) return null;
            } else if (typeof childIndex === "number") {
                var elements = doc.getElementsByTagName(tagName);
                for (var j = 0, lenj = elements.length; j < lenj; j++) {
                    if (elements[j] && elements[j].parentNode && elements[j].parentNode instanceof HTMLElement && elements[j].parentNode.children[childIndex] === elements[j]) {
                        element = elements[j];
                        continues = true;
                        break;
                    }
                }
                if (!continues) return null;
            } else {
                element = doc.getElementsByTagName(tagName)[0];
            }

            if (!element) {
                return null;
            }
        }

        return element;
    }

    function getRegisteredElementUniqueId(el) {
        for (var key in groups) {
            if (groups.hasOwnProperty(key)) {
                var children = groups[key].children;
                for (var i = 0, len = children.length; i < len; i++) {
                    if (el === children[i].element) {
                        return children[i].id;
                    }
                }
            }
        }
        return null;
    }

    function getRegisteredElementByUniqueId(id) {
        for (var key in groups) {
            if (groups.hasOwnProperty(key)) {
                var children = groups[key].children;
                for (var i = 0, len = children.length; i < len; i++) {
                    if (id === children[i].id) {
                        return children[i].element;
                    }
                }
            }
        }
        return null;
    }

    function isElementRegistered(el) {
        for (var id in groups) {
            if (groups.hasOwnProperty(id)) {
                if (isElementInGroup(el, id)) {
                    return true;
                }
            }
        }
        return false;
    }

    function isElementInGroup(el, groupId) {
        //if (!groups[groupId]) throw "Group " + groupId + " does not exist!";
        if (!groups[groupId]) return false;

        var children = groups[groupId].children;
        for (var i = 0, len = children.length; i < len; i++) {
            if (children[i].element === el) {
                return true;
            }
        }
        return false;
    }

    function createReferenceList() {
        var map = {};
        for (var key in groups) {
            if (groups.hasOwnProperty(key)) {
                var group = groups[key];

                var groupElements = [];
                var el = group.element;
                if (el && el.children) {
                    var children = el.children;
                    for (var i = 0, len = children.length; i < len; i++) {
                        var child = children[i];
                        var data = { };
                        if (isElementRegistered(child)) {
                            data.type = REGISTERED;
                            data.uniqueId = getRegisteredElementUniqueId(child);
                            data.element = child;
                        } else {
                            data.type = NONREGISTERED;
                            data.uniqueId = getElementUniqueId(child);
                            data.element = child;
                        }
                        groupElements.push(data);
                    }
                }
                map[key] = groupElements;
            }
        }
        return map;
    }

    function getReferencedUniqueId(child, reference) {
        if (!reference) return null;

        for (var key in reference) {
            if (reference.hasOwnProperty(key)) {
                var group = reference[key];
                for (var i = 0, len = group.length; i < len; i++) {
                    if (child === group[i].element) {
                        return group[i].uniqueId;
                    }
                }
            }
        }
        return null;
    }

    function getReferencedElement(id, reference) {
        if (!reference) return null;

        for (var key in reference) {
            if (reference.hasOwnProperty(key)) {
                var group = reference[key];
                for (var i = 0, len = group.length; i < len; i++) {
                    if (id === group[i].uniqueId) {
                        return group[i].element;
                    }
                }
            }
        }
        return null;
    }

    function getSortList(referenceList) {
        var map = {};
        for (var key in groups) {
            if (groups.hasOwnProperty(key)) {
                var group = groups[key];

                var groupElements = [];
                var el = group.element;
                if (el && el.children) {
                    var children = el.children;
                    for (var i = 0, len = children.length; i < len; i++) {
                        var child = children[i];
                        var data = { };
                        if (isElementRegistered(child)) {
                            data.type = REGISTERED;
                            data.uniqueId = getRegisteredElementUniqueId(child);
                        } else {
                            data.type = NONREGISTERED;
                            data.uniqueId = getReferencedUniqueId(child, referenceList) || getElementUniqueId(child);
                        }
                        groupElements.push(data);
                    }
                }
                map[key] = groupElements;
            }
        }
        return map;
    }

    function setSortList(list, referenceList) {
        utils.each(list, function(groupId, elements){
            if (!groups[groupId]) con.warn("Group " + groupId + " does not exist!");

            var group = groups[groupId];
            for (var i = 0, len = elements.length; i < len; i++) {
                var element = elements[i];
                var el = null;
                if (element.type === REGISTERED) {
                    el = getRegisteredElementByUniqueId(element.uniqueId);
                } else if (element.type === NONREGISTERED) {
                    el = getReferencedElement(element.uniqueId, referenceList) || getElementByUniqueId(element.uniqueId);
                }

                if (el !== null) {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }

                    group.element.appendChild(el);
                } else {
                    con.warn("Unknown element in settings", element);
                }
            }
        });
    }

    function setMoveable(enabled) {
        ytcenter.placementdragdrop.setGroupElements(getGroupElements());
        ytcenter.placementdragdrop.setEnabled(enabled);
    }

    function getGroupElements() {
        var groupElements = [];
        for (var key in groups) {
            if (groups.hasOwnProperty(key)) {
                groupElements.push(groups[key].element);
            }
        }
        return groupElements;
    }

    function clearGroups() {
        groups = {};
    }

    /* Easier access to ytcenter.utils */
    var utils = ytcenter.utils;

    var REGISTERED = 0;
    var NONREGISTERED = 1;

    var groups = {};

    var transformation = [
        {
            query: {
                id: 'watch-like-dislike-buttons',
                className: null
            },
            transform: {
                id: null,
                className: ['like-button-renderer']
            }
        }
    ];

    var exports = {};

    /* Make the API public */
    exports.setMoveable = setMoveable;
    exports.addElement = addElement;
    exports.createGroup = createGroup;
    exports.getSortList = getSortList;
    exports.setSortList = setSortList;
    exports.createReferenceList = createReferenceList;
    exports.clearGroups = clearGroups;

    global[propertyName] = exports;
})(ytcenter, "placementsystem");

/* Is responsible for the "focus" effect (lights out except for the area
   where the buttons are) when editing placement */
(function(global, propertyName){
    function createOverlay() {
        var overlay = document.createElement("div");
        overlay.className = "element-focus-overlay";
        return overlay;
    }

    function focus(target, saveFunc, cancelFunc) {
        var replacementHolder = document.createElement("div");
        replacementHolder.style.height = target.offsetHeight + "px";

        var targetPos = utils.getAbsolutePosition(target);
        var targetWidth = target.offsetWidth;
        var targetHeight = target.offsetHeight;

        // Eclipse math
        //var sqrt2 = Math.sqrt(2);
        //var paddTop = targetHeight/sqrt2 - targetHeight/2 + 10;
        //var paddLeft = targetWidth/sqrt2 - targetWidth/2 + 10;

        // Box math
        var paddTop = 15;
        var paddLeft = 15;

        target.parentNode.replaceChild(replacementHolder, target);

        var wrapper = document.createElement("div");
        wrapper.className = "element-focus-wrapper";

        wrapper.style.top = (targetPos.y - paddTop) + "px";
        wrapper.style.left = (targetPos.x - paddLeft) + "px";

        var focusEl = document.createElement("div");
        focusEl.className = "element-focus";
        focusEl.style.padding = paddTop + "px " + paddLeft + "px";
        focusEl.style.width = targetWidth + "px";

        wrapper.appendChild(focusEl);

        var focusContainer = document.createElement("div");
        focusContainer.className = "element-focus-container";

        focusEl.appendChild(focusContainer);
        focusContainer.appendChild(target);

        var btnWrapper = document.createElement("div");
        btnWrapper.className = "element-focus-btn-wrapper";

        var labelSave = ytcenter.gui.createYouTubeButtonTextLabel("BTN_APPLY");
        var btnSave = ytcenter.gui.createYouTubePrimaryButton("", [ labelSave ]);
        btnSave.addEventListener("click", saveFunc, false);

        var labelCancel = ytcenter.gui.createYouTubeButtonTextLabel("BTN_CANCEL");
        var btnCancel = ytcenter.gui.createYouTubeDefaultButton("", [ labelCancel ]);
        btnCancel.addEventListener("click", cancelFunc, false);

        btnWrapper.appendChild(btnSave);
        btnWrapper.appendChild(btnCancel);

        wrapper.appendChild(btnWrapper);

        var overlay = createOverlay();

        document.body.appendChild(overlay);
        document.body.appendChild(wrapper);

        var oldScroll = ytcenter.utils.scrollTop();
        var viewPort = ytcenter.utils.getViewPort();

        ytcenter.utils.scrollTop(targetPos.y - (viewPort.height - wrapper.offsetHeight)/2);

        //ytcenter.utils.addClass(document.body, "ytcenter-dialog-active");

        return function(){
            //ytcenter.utils.removeClass(document.body, "ytcenter-dialog-active");
            ytcenter.utils.scrollTop(oldScroll);

            target.parentNode.removeChild(target);
            replacementHolder.parentNode.replaceChild(target, replacementHolder);

            overlay.parentNode.removeChild(overlay);
            wrapper.parentNode.removeChild(wrapper);
        };
    }

    var utils = ytcenter.utils;

    var exports = {};
    exports.focus = focus;

    global[propertyName] = exports;
})(ytcenter, "elementfocus");