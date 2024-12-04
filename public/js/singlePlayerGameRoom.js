// singleplayergameroom.js

function initSinglePlayerGameRoom() {
    let maxWidth;
    let maxHeight;
    let oldCanvasSize;

    console.log("Initializing single-player game room...");

    // Function to calculate the full canvas size based on the screen dimensions, ensuring it's a multiple of 100px
    function calculateCanvasSize(width, height) {
        let minNumber = Math.min(width, height);
        return Math.floor(minNumber / 100) * 100 - 100;
    }

    // Measures the maximum available canvas size based on the viewport
    function calculateMaxDivSize() {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.width = '100%';
        tempDiv.style.height = '100%';
        tempDiv.style.left = '0';
        tempDiv.style.top = '0';

        const parentElement = document.body;
        parentElement.appendChild(tempDiv);

        maxWidth = tempDiv.clientWidth;
        maxHeight = tempDiv.clientHeight;

        parentElement.removeChild(tempDiv);

        console.log(`Max width: ${maxWidth}px, Max height: ${maxHeight}px`);
    }

    // Adds all HTML content dynamically (title and full-screen canvas)
    function addHtmlContent() {
        // Set document title and meta tag
        document.xmlns = "http://www.w3.org/1999/xhtml";
        document.head.innerHTML = `
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>PatchPartners - Single Player</title>
        `;

        // Create and attach link elements for stylesheets
        var link1 = createLinkElement("css/jquery-ui.css");
        var link2 = createLinkElement("css/jquery-ui.theme.css");
        var link3 = createLinkElement("css/sewsynth.css");
        var link4 = createLinkElement("css/endScreen.css");

        // Main container for canvas and title
        var mainDiv = document.createElement('div');
        var parentDiv = document.createElement('div');
        parentDiv.className = "fill-area";
        parentDiv.id = "singlePlayerCanvas";
        parentDiv.style.position = 'relative';

        // Title row
        var titleRowDiv = document.createElement('div');
        titleRowDiv.id = "titleRow";

        var titleDiv = document.createElement('div');
        titleDiv.id = "gameTitle";
        titleDiv.textContent = "PatchPartners - Single Player Mode";

        titleRowDiv.appendChild(titleDiv);
        mainDiv.appendChild(titleRowDiv);

        // Wrapper for canvas
        var wrapperDiv = document.createElement('div');
        wrapperDiv.className = "wrapper";
        wrapperDiv.id = "mainDiv";
        wrapperDiv.style.display = "flex";

        // Full-screen canvas for single player
        var canvasDiv = document.createElement('canvas');
        canvasDiv.id = "canvas";
        canvasDiv.style.width = "100%";
        canvasDiv.style.height = "100%";
        wrapperDiv.appendChild(canvasDiv);

        // Append wrapper and main container to body
        parentDiv.appendChild(wrapperDiv);
        mainDiv.appendChild(parentDiv);
        document.body.appendChild(mainDiv);

        // Attach all stylesheets to document head
        document.head.appendChild(link1);
        document.head.appendChild(link2);
        document.head.appendChild(link3);
        document.head.appendChild(link4);
        console.log("Single-player canvas initialized.");
    }

    // Handle window resize and update canvas dimensions
    window.addEventListener("resize", function() {
        resize();
    });

    function resize() {
        calculateMaxDivSize();
        const canvas = document.getElementById('canvas');
        if (canvas) {
            oldCanvasSize = parseInt(canvas.style.height, 10) || 600;
        }

        const correctCanvasSize = calculateCanvasSize(maxWidth, maxHeight);

        // Update wrapper and canvas dimensions to be full screen
        const wrapperDiv = document.getElementById('mainDiv');
        if (wrapperDiv) {
            wrapperDiv.style.width = `${correctCanvasSize}px`;
            wrapperDiv.style.height = `${correctCanvasSize}px`;
        }

        if (canvas) {
            canvas.style.width = `${correctCanvasSize}px`;
            canvas.style.height = `${correctCanvasSize}px`;
        }

        saveCalculatedDimensions(correctCanvasSize, correctCanvasSize);
    }

    // Save the calculated dimensions for the canvas (globally)
    function saveCalculatedDimensions(height, width) {
        global.calcHeight = height;
        global.calcWidth = width;
        console.log("Canvas dimensions set to: " + global.calcHeight + " x " + global.calcWidth);
    }

    // Initialize the application
    function initApp() {
        try {
            initErrorHandler();
            initHistoryHandler();
            initCanvas();
            initDesignGenerator();
            initDesignHandler();
            initNoise(Math.random());

            initilizeMenus(); 
            updateMenuPositions(); 
            initKeys(); 

            console.log("Single-player mode ready!");
        } catch (e) {
            if (global.mainErrorHandler) {
                global.mainErrorHandler.displayError("Initialization failed", e);
            } else {
                console.error("Initialization failed:", e);
            }
        }
    }

    // Initialize each handler (copied from your original game room code)
    function initErrorHandler() { global.mainErrorHandler = new ErrorHandler(); }
    function initHistoryHandler() { global.mainHistoryHandler = new HistoryHandler(); }
    function initCanvas() {
        saveCalculatedDimensions();
        global.mainCanvasHandler = new CanvasHandler("canvas");
    }
    function initDesignHandler() { global.mainDesignHandler = new DesignHandler(); }
    function initDesignGenerator() { global.mainDesignGenerator = new DesignGenerator(); }
    function initNoise(seed) { noise.seed(seed); }
    function initKeys() {
        global.keyMap[17] = false;
        global.keyMap[90] = false;
        global.keyMap[89] = false;
        global.keyEventFired.undo = false;
        global.keyEventFired.redo = false;
    }

    function updateKeyEvent(e) {
        e = e || event; 
        global.keyMap[e.keyCode] = e.type == 'keydown';
    }

    // Load the app and start game room initialization
    function onLoad() {
        addHtmlContent();
        document.getElementById('uploadImg').addEventListener('change', handleFileSelection, false);
        initApp();
        resize();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onLoad);
    } else {
        onLoad();
    }
}

// Export the function so it can be called from main.js
window.initSinglePlayerGameRoom = initSinglePlayerGameRoom;

// Utility function for creating link elements
function createLinkElement(href) {
    const link = document.createElement('link');
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    return link;
}

// Handle file selection for the single-player mode
function handleFileSelection(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;
    if (!files) {
        alert("Invalid selection - please do not select any folders.");
        return;
    }

    for (var i = 0, file; file = files[i]; i++) {
        if (!file) {
            alert("Unable to access " + file.name); 
            continue;
        }
        if (file.size === 0) {
            alert("Skipping " + file.name.toUpperCase() + " because it is empty.");
            continue;
        }
        global.mainCanvasHandler.loadUserImage(file);
    }
}
