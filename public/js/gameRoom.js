function initGameRoom() {
    console.log("Initializing game room...");

    function addHtmlContent() {
        document.xmlns = "http://www.w3.org/1999/xhtml";
        document.head.innerHTML = `
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>PatchPartners</title>
        `;
        var link1 = document.createElement('link');
        link1.rel = "stylesheet";
        link1.type = "text/css";
        link1.href = "css/jquery-ui.css";

        var link2 = document.createElement('link');
        link2.rel = "stylesheet";
        link2.type = "text/css";
        link2.href = "css/jquery-ui.theme.css";

        var link3 = document.createElement('link');
        link3.rel = "stylesheet";
        link3.type = "text/css";
        link3.href = "css/sewsynth.css";

        var div = document.createElement('div');
        div.className = "fill-area";
        div.id = "hundred";
        div.innerHTML = `
            <div class="wrapper flex_grow fill-area" id="mainDiv">
                <div class="flex_grow fill-area" id="svg_div">
                    <canvas class="flex_grow fill-area" id="canvas"></canvas>
                </div>
            </div>
            <div class="menu_div" id="image_options">Image Options
                <input type="file" id="uploadImg" name="files[]" class="image_options_menuGuts menu_item"/>    
            </div>
            <div class="menu_div_nonExpanding" id="print"></div>
            <div class="menu_div_nonExpanding" id="toolbox"></div>
        `;

        document.body.appendChild(div);
        document.head.appendChild(link1);
        document.head.appendChild(link2);
        document.head.appendChild(link3);
        console.log("Append Children");
    }

    function handleFileSelection(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;

        if (!files) {
            alert("<p>At least one selected file is invalid - do not select any folders.</p><p>Please reselect and try again.</p>");
            return;
        }

        for (var i = 0, file; file = files[i]; i++) {
            if (!file) {
                alert("Unable to access " + file.name); 
                continue;
            }
            if (file.size == 0) {
                alert("Skipping " + file.name.toUpperCase() + " because it is empty.");
                continue;
            }
            global.mainCanvasHandler.loadUserImage(file);
        }
        console.log("handleFileSelection");
    }

    function initApp() {
        try {
            initErrorHandler(); // Ensure this is called first to initialize mainErrorHandler
            console.log("1");
            initHistoryHandler();
            console.log("2");
            initCanvas();
            console.log("3");
            initDesignGenerator();
            console.log("4");
            initDesignHandler();
            console.log("5");
            initNoise(Math.random());
            
            initilizeMenus(); // in guiHandler.js 
            // ^ !! NOTE !! Must be called after DesignHandler as it uses a function in the global.mainDesignHandler
            console.log("6");
            // Move the menus over... need to also update this on resize...
            updateMenuPositions();
            console.log("7");
            
            initKeys();
        
            
            console.log("ready!");
        } catch (e) {
            if (global.mainErrorHandler) {
                global.mainErrorHandler.displayError("catastrophic failure -- initialization failed", e);
            } else {
                console.error("Initialization failed and error handler is not available:", e);
            }
        }
    }

    function initErrorHandler() {
        global.mainErrorHandler = new ErrorHandler();
    }

    function initHistoryHandler() {
        global.mainHistoryHandler = new HistoryHandler();
    }

    function initCanvas() {
        saveCalculatedDimensions();
        console.log("8");
        global.mainCanvasHandler = new CanvasHandler("canvas");
    }

    function initDesignHandler() {
        global.mainDesignHandler = new DesignHandler();
    }

    function initDesignGenerator() {
        global.mainDesignGenerator = new DesignGenerator();
    }

    function initNoise(seed) {
        noise.seed(seed);
    }

    function initKeys() {
        global.keyMap[17] = false;
        global.keyMap[90] = false;
        global.keyMap[89] = false;
        
        global.keyEventFired.undo = false;
        global.keyEventFired.redo = false;
    }

    function updateKeyEvent(e) {
        e = e || event; // to deal with IE
        global.keyMap[e.keyCode] = e.type == 'keydown';
    }

    function saveCalculatedDimensions() {
        global.calcHeight = $("#mainDiv").height();
        global.calcWidth = $("#mainDiv").width();
        // global.calcHeight = 500;
        // global.calcWidth = 500;
        console.log("calculating height & width... " + global.calcHeight + ", " + global.calcWidth);
    }

    function displayFileImg(filename, evt) {
        var view = new jDataView(evt.target.result, 0, evt.size);
    }

    window.onkeyup = function(e) {
        updateKeyEvent(e);
        if (global.keyMap[17] == false || global.keyMap[90] == false) {
            global.keyEventFired.undo = false;
        }
        if (global.keyMap[17] == false || global.keyMap[89] == false) {
            global.keyEventFired.redo = false;
        }
    };

    window.onkeydown = function(e) {
        var oldKeyMap = global.keyMap;
        updateKeyEvent(e);
        if (global.mainHistoryHandler !== null) {
            if (global.keyMap[17] == true && global.keyMap[90] == true &&
                global.keyEventFired.undo == false) {
                global.mainHistoryHandler.doUndo();
                console.log("UNDOOOOOO");
                global.keyEventFired.undo = true;
            }
            if (global.keyMap[17] == true && global.keyMap[89] == true &&
                global.keyEventFired.redo == false) {
                global.mainHistoryHandler.doRedo();
                console.log("REdooo");
                global.keyEventFired.redo = true;
            }
        }
    };

    window.addEventListener("resize", function() {
        saveCalculatedDimensions();
        
        // resize canvas to CANVAS SIZE! aka main Div size!
        paper.view.viewSize.width = global.calcWidth;
        paper.view.viewSize.height = global.calcHeight;
        
        // move menus
        updateMenuPositions();
    });

    function onLoad() {
        addHtmlContent();
        document.getElementById('uploadImg').addEventListener('change', handleFileSelection, false);
        initApp();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onLoad);
    } else {
        onLoad();
    }
}

// Export the function so it can be called from main.js
window.initGameRoom = initGameRoom;
