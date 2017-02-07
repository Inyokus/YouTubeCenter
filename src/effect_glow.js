/* The player "glow" effect */

ytcenter.effects.playerGlow = (function(){
    function inCorrectMode() {
        return (glowEffectOnPlayer === "both" || (ytcenter.player.isLightOff && glowEffectOnPlayer === "only-lights-off") || (!ytcenter.player.isLightOff && glowEffectOnPlayer === "only-without-lights-off"));
    }
    function playerStateChange(s) {
        state = s;
        if (state === 1 && enabled && inCorrectMode()) {
            stopPlaying();
            onPlaying();
        } else {
            stopPlaying();
        }
    }
    function update() {
        var api = ytcenter.player.getAPI();
        if (api && typeof api.getPlayerState === "function") {
            playerStateChange(api.getPlayerState());
        }
    }
    function getPlayerAPIElement() {
        return document.getElementById("player-api");
    }
    function getPlayerWrapperOverlay() {
        return document.getElementById("movie_player") || document.getElementById("player-api") || document.getElementById("player");
    }
    function getPlayerWrapper() {
        return document.getElementById("player-api") || document.getElementById("player") || document.getElementById("movie_player");
    }
    function getCorrectPlayerElement() {
        return ((glowEffectOnPlayer === "both" || glowEffectOnPlayer === "only-lights-off") ? playerElementOverlay : playerElement);
    }
    function onPlaying() {
        html5Player = ytcenter.utils.getHTML5Player();
        playerElement = getPlayerWrapper();
        playerElementOverlay = getPlayerWrapperOverlay();
        correctPlayerElement = getCorrectPlayerElement();
        playerAPIElement = getPlayerAPIElement();

        if (playerAPIElement && (glowEffectOnPlayer === "both" || glowEffectOnPlayer === "only-lights-off")) {
            playerAPIElement.style.overflow = "visible";
        }

        if (!container.parentNode) {
            playerAPIElement.appendChild(container);
        }

        con.log("[Player Glow] In correct mode? " + inCorrectMode());

        /* We want to make sure that the html5 player exist */
        if (html5Player && enabled && inCorrectMode()) {
            allowGlowUpdate = true;
            /* Let's get this running */
            onRequestGlow();
        }
    }
    function stopPlaying() {
        /* Remove the glow if the player was unstartet or ended (we don't need to do this if it's only paused) */
        if (state < 1 || !inCorrectMode()) {
            if (!playerElement) playerElement = getPlayerWrapper(); // Make sure that the player wrapper is referenced so that the glow can be removed.
            if (!playerElementOverlay) playerElementOverlay = getPlayerWrapperOverlay(); // Make sure that the player wrapper is referenced so that the glow can be removed.
            if (!correctPlayerElement) correctPlayerElement = getCorrectPlayerElement();
            if (!playerAPIElement) playerAPIElement = getPlayerAPIElement(); // Make sure that the player wrapper is referenced so that the glow can be removed.
            if (playerAPIElement && (glowEffectOnPlayer === "both" || glowEffectOnPlayer === "only-lights-off")) {
                playerAPIElement.style.overflow = "";
            }
            removeMultiGlow();
            removeGlow();
        } else if (state === 1) {
            if (!playerElement) playerElement = getPlayerWrapper(); // Make sure that the player wrapper is referenced so that the glow can be removed.
            if (!playerElementOverlay) playerElementOverlay = getPlayerWrapperOverlay(); // Make sure that the player wrapper is referenced so that the glow can be removed.
            if (!correctPlayerElement) correctPlayerElement = getCorrectPlayerElement();
            if (!playerAPIElement) playerAPIElement = getPlayerAPIElement(); // Make sure that the player wrapper is referenced so that the glow can be removed.
            if (playerAPIElement && (glowEffectOnPlayer === "both" || glowEffectOnPlayer === "only-lights-off")) {
                playerAPIElement.style.overflow = "";
            }
            removeMultiGlow();
            removeGlow();
        }

        /* We don't need the references */
        html5Player = null;
        playerElement = null;
        playerElementOverlay = null;
        correctPlayerElement = null;
        playerAPIElement = null;

        if (timeoutId) {
            uw.clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (requestFrameId) {
            cancelFrame(requestFrameId);
            requestFrameId = null;
        }
        allowGlowUpdate = false;
    }
    function onRequestGlow(now) {
        if (state !== 1) return;

        var w = widthF;
        var h = heightF;

        /* Resize the canvas to the video */
        width = html5Player.clientWidth || html5Player.offsetWidth;
        height = html5Player.clientHeight || html5Player.offsetHeight;

        container.style.width = width + "px";
        container.style.height = height + "px";

        /* Factor the size down of the canvas to increase the performance */
        widthF = canvas.width = width*factor;
        heightF = canvas.height = height*factor;

        if (widthF === 0 || heightF === 0) return;

        /* Calculate the amount of pixels used */
        if (w !== widthF || h !== heightF) {
            totalPixels = widthF*heightF;
            pixelCount = Math.floor(totalPixels/pixelInterval);
            clearGlowCache();
        }

        /* Handle the delta time */
        now = now || ytcenter.utils.now();
        lastTimestamp = lastTimestamp || now;
        var dt = (now - lastTimestamp)/1000;
        lastTimestamp = now;

        if (multiglow) {
            removeGlow();
            var blocks = calculateBlocks(width, height);

            /* Draw the video frame onto the canvas */
            drawVideoOnCanvas();

            /* Get the frame data (Unescapable bottleneck) */
            var imageData = ctx.getImageData(0, 0, widthF, heightF);

            /* Get the data reference */
            var data = imageData.data;

            for (var i = 0, len = blocks.length; i < len; i++) {
                applyGlowOnBlock(i, blocks[i], data, blur, spread, opacity);
            }
        } else {
            removeMultiGlow();
            /* We want the average color */
            color = getAverageColor(dt, color);

            /* Apply the new rgb values to the glow */
            applyGlow(color, blur, spread, opacity);
        }

        if (allowGlowUpdate) {
            /* We really want to run this again to change the color of the glow for the next frame */
            if (interval >= 0) {
                timeoutId = uw.setTimeout(onRequestGlow, interval);
            } else {
                requestFrameId = reqFrame(onRequestGlow);
            }
        }
    }
    function clearGlowCache() {
        blockCache = [];
        for (var i = 0, len = blockGlowCache.length; i < len; i++) {
            if (blockGlowCache[i].parentNode) {
                blockGlowCache[i].parentNode.removeChild(blockGlowCache[i]);
            }
        }
        blockGlowCache = [];
    }
    function drawVideoOnCanvas() {
        /* Write video data to canvas */
        ctx.drawImage(html5Player, 0, 0, widthF, heightF);
    }
    function calculateBlock(x, y, width, height) {
        if (blockCache[x] && blockCache[x][y]) {
            return blockCache[x][y];
        }
        var block = [];
        for (var i = 0, len = width*height; i < len; i++) {
            block.push([x + i%width, y + Math.floor(i/width)]);
        }
        if (!blockCache[x]) blockCache[x] = [];
        blockCache[x][y] = block;

        return block;
    }
    function calculateBlocks() {
        var blocks = [];

        var corners = depth/blockInterval;
        corners = 0;

        /* Top */
        for (var i = 0, len = width/blockInterval - corners; i < len; i++) {
            var pos = {
                x: i*blockInterval,
                y: 0,
                width: blockInterval,
                height: depth
            };
            if (pos.x + pos.width > width) {
                pos.width = width - pos.x;
            }

            pos.xF = Math.floor(pos.x*factor);
            pos.yF = Math.floor(pos.y*factor);
            pos.widthF = Math.floor(pos.width*factor);
            pos.heightF = Math.floor(pos.height*factor);

            pos.data = calculateBlock(pos.xF, pos.yF, pos.widthF, pos.heightF);
            blocks.push(pos);
        }

        /* Bottom */
        for (var i = corners, len = width/blockInterval; i < len; i++) {
            var pos = {
                x: i*blockInterval,
                y: height - depth,
                width: blockInterval,
                height: depth
            };
            if (pos.x + pos.width > width) {
                pos.width = width - pos.x;
            }

            pos.xF = Math.floor(pos.x*factor);
            pos.yF = Math.floor(pos.y*factor);
            pos.widthF = Math.floor(pos.width*factor);
            pos.heightF = Math.floor(pos.height*factor);

            pos.data = calculateBlock(pos.xF, pos.yF, pos.widthF, pos.heightF);
            blocks.push(pos);
        }

        /* Left */
        for (var i = corners, len = height/blockInterval; i < len; i++) {
            var pos = {
                x: 0,
                y: i*blockInterval,
                width: depth,
                height: blockInterval
            };
            if (pos.y + pos.height > height) {
                pos.height = height - pos.y;
            }

            pos.xF = Math.floor(pos.x*factor);
            pos.yF = Math.floor(pos.y*factor);
            pos.widthF = Math.floor(pos.width*factor);
            pos.heightF = Math.floor(pos.height*factor);

            pos.data = calculateBlock(pos.xF, pos.yF, pos.widthF, pos.heightF);
            blocks.push(pos);
        }

        /* Right */
        for (var i = 0, len = height/blockInterval - corners; i < len; i++) {
            var pos = {
                x: width - depth,
                y: i*blockInterval,
                width: depth,
                height: blockInterval
            };
            if (pos.y + pos.height > height) {
                pos.height = height - pos.y;
            }

            pos.xF = Math.floor(pos.x*factor);
            pos.yF = Math.floor(pos.y*factor);
            pos.widthF = Math.floor(pos.width*factor);
            pos.heightF = Math.floor(pos.height*factor);

            pos.data = calculateBlock(pos.xF, pos.yF, pos.widthF, pos.heightF);
            blocks.push(pos);
        }

        return blocks;
    }

    function getAverageColorForBlock(pixels, data) {
        var minx = -1;
        var miny = -1;
        var maxx = -1;
        var maxy = -1;
        for (var i = 0, len = pixels.length; i < len; i++) {
            if (pixels[i][0] < minx || minx === -1) {
                minx = pixels[i][0];
            }
            if (pixels[i][0] > maxx || maxx === -1) {
                maxx = pixels[i][0];
            }
            if (pixels[i][1] < miny || miny === -1) {
                miny = pixels[i][1];
            }
            if (pixels[i][1] > maxy || maxy === -1) {
                maxy = pixels[i][1];
            }
        }

        /* Prepare variables for the loop */
        var r = 0, g = 0, b = 0, idx, i = pixels.length - 1;

        var pixelCount = Math.floor(pixels.length/pixelInterval);

        /* Loop through every pixel */
        while (i > 0) {
            idx = Math.floor(pixels[i][0] + pixels[i][1]*widthF) << 2;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];

            i -= pixelInterval;
        }

        /* We are dividing by a variable that could be 0 */
        if (pixelCount > 0) {
            /* Average the color */
            r = Math.floor(r/pixelCount);
            g = Math.floor(g/pixelCount);
            b = Math.floor(b/pixelCount);
        }

        /* Make sure that the rgb color doesn't go under 0 or over 255 */
        if (r < 0) r = 0;
        if (r > 255) r = 255;

        if (g < 0) g = 0;
        if (g > 255) g = 255;

        if (b < 0) b = 0;
        if (b > 255) b = 255;

        return { r: r, g: g, b: b };
    }
    function getAverageColor(dt, lastColor) {
        drawVideoOnCanvas();

        /* Get the frame data (Unescapable bottleneck) */
        var imageData = ctx.getImageData(0, 0, widthF, heightF);

        /* Get the data reference */
        var data = imageData.data;

        /* Prepare variables for the loop */
        var i, r = 0, g = 0, b = 0;

        /* Loop through every pixel */
        for (i = 0; i < totalPixels; i += pixelInterval) {
            idx = i << 2;

            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
        }

        /* We are dividing by a variable that could be 0 */
        if (pixelCount > 0) {
            /* Average the color */
            r = Math.floor(r/pixelCount);
            g = Math.floor(g/pixelCount);
            b = Math.floor(b/pixelCount);
        }

        if (lastColor && transition > 0) {
            /* Make sure that it can't transition past the destination */
            var dest = Math.min(dt/transition, 1);
            /* Transition from color to another */
            r = lastColor.r + (r - lastColor.r)*dest;
            g = lastColor.g + (g - lastColor.g)*dest;
            b = lastColor.b + (b - lastColor.b)*dest;
        }

        /* Make sure that the rgb color doesn't go under 0 or over 255 */
        if (r < 0) r = 0;
        if (r > 255) r = 255;

        if (g < 0) g = 0;
        if (g > 255) g = 255;

        if (b < 0) b = 0;
        if (b > 255) b = 255;

        return { r: r, g: g, b: b };
    }

    function applyGlowOnBlock(i, block, data, blur, radius, opacity) {
        var color = getAverageColorForBlock(block.data, data);
        var el;
        if (blockGlowCache[i]) {
            el = blockGlowCache[i];
        } else {
            el = document.createElement("div");
            el.className = "gpu";
            el.style.position = "absolute";
            el.style.top = block.y + "px";
            el.style.left = block.x + "px";
            el.style.width = block.width + "px";
            el.style.height = block.height + "px";
            el.style.zIndex = (i%2 ? "52" : "53");

            container.appendChild(el);
            blockGlowCache[i] = el;
        }

        var value = "0px 0px " + blur + "px " + radius + "px rgba(" + Math.floor(color.r) + ", " + Math.floor(color.g) + ", " + Math.floor(color.b) + ", " + opacity + ")";
        el.style.setProperty("-webkit-box-shadow", value);
        el.style.setProperty("-moz-box-shadow", value);
        el.style.setProperty("box-shadow", value);
    }

    function applyGlow(color, blur, radius, opacity) {
        var value = "0px 0px " + blur + "px " + radius + "px rgba(" + Math.floor(color.r) + ", " + Math.floor(color.g) + ", " + Math.floor(color.b) + ", " + opacity + ")";
        correctPlayerElement.style.setProperty("-webkit-box-shadow", value);
        correctPlayerElement.style.setProperty("-moz-box-shadow", value);
        correctPlayerElement.style.setProperty("box-shadow", value);
    }

    function removeGlow(){
        playerElement.style.setProperty("-webkit-box-shadow", "");
        playerElement.style.setProperty("-moz-box-shadow", "");
        playerElement.style.setProperty("box-shadow", "");
        playerElementOverlay.style.setProperty("-webkit-box-shadow", "");
        playerElementOverlay.style.setProperty("-moz-box-shadow", "");
        playerElementOverlay.style.setProperty("box-shadow", "");
    }

    function removeMultiGlow() {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }

    function setEnabled(e) {
        enabled = !!e;
        update();
    }

    function setOption(key, value) {
        switch (key) {
            case "pixelInterval":
                pixelInterval = value;
                if (pixelInterval <= 0) pixelInterval = 1;
                totalPixels = width * height;
                pixelCount = Math.floor(totalPixels/pixelInterval);
                break;
            case "interval":
                interval = value;
                break;
            case "transition":
                transition = value;
                break;
            case "blur":
                blur = value;
                break;
            case "spread":
                spread = value;
                break;
            case "opacity":
                opacity = value;
                break;
            case "glowEffectOnPlayer":
                glowEffectOnPlayer = value;
                break;
            case "multiglow":
                multiglow = value;
                break;
            case "depth":
                depth = value;
                break;
            case "blockInterval":
                blockInterval = value;
                break;
            case "factor":
                factor = value/100;
                break;
        }
        update();
    }

    var reqFrame = uw.requestAnimationFrame || uw.mozRequestAnimationFrame || uw.webkitRequestAnimationFrame || uw.msRequestAnimationFrame;
    var cancelFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    var timeoutId = null;
    var requestFrameId = null;

    var enabled = false;
    var width, height;
    var factor = 0.5;
    var widthF, heightF; // Factored

    var state = -1;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    var pixelCount = null;
    var totalPixels = null;

    var blockGlowCache = [];
    var blockCache = [];
    var container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "0";
    container.style.left = "0";

    var html5Player = null;
    var playerElement = null;
    var playerElementOverlay = null;
    var correctPlayerElement = null;
    var playerAPIElement = null;
    var color = null;
    var lastTimestamp = null;

    /* Options */
    var pixelInterval = 100000; /* Iterate every nth pixel instead of every single pixel */
    var interval = -1; /* If interval is -1 it will use requestAnimationFrame instead of setTimeout */
    var transition = 0; /* The transition time in seconds */
    var blur = 15;
    var spread = 5;
    var opacity = .75;
    var glowEffectOnPlayer = "both";
    var multiglow = true;
    var depth = 10;
    var blockInterval = 40;

    var allowGlowUpdate = false;

    ytcenter.player.listeners.addEventListener("onStateChange", playerStateChange);

    return {
        setEnabled: setEnabled,
        setOption: setOption,
        update: update
    };
})();