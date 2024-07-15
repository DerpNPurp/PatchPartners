function initGameRoom() {
    function addHtmlContent() {
        var newDiv = document.createElement('div');
        newDiv.className = 'fill-area';
        newDiv.id = 'hundred';

        newDiv.innerHTML = `
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

        document.body.appendChild(newDiv);
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
    }

    function initApp() {
        try {
            // Import the rest of the functions
            initErrorHandler();
            initHistoryHandler();
            initCanvas(); // also initializes canvasHandler
            initDesignGenerator();
            initDesignHandler();
            initNoise(Math.random());
            
            initilizeMenus(); // in guiHandler.js 
            // ^ !! NOTE !! Must be called after DesignHandler as it uses a function in the global.mainDesignHandler
            
            // Move the menus over... need to also update this on resize...
            updateMenuPositions();
            
            initKeys();
            
            console.log("ready!");
        } catch (e) {
            global.mainErrorHandler.displayError("catastrophic failure -- initialization failed", e);
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        addHtmlContent();
        document.getElementById('uploadImg').addEventListener('change', handleFileSelection, false);
        initApp();
    });

    var saveCalculatedDimensions = function() {
        global.calcHeight = $("#mainDiv").height();
        global.calcWidth = $("#mainDiv").width();
        console.log("calculating height & width... " + global.calcHeight + ", " + global.calcWidth);
    };

    var initCanvas = function() {
        saveCalculatedDimensions(); // Needed to initialize new canvas at an actual decent size...
        global.mainCanvasHandler = new CanvasHandler("canvas");
    };

    var initDesignHandler = function() {
        global.mainDesignHandler = new DesignHandler();
    };

    var initDesignGenerator = function() {
        global.mainDesignGenerator = new DesignGenerator();
    };

    var initErrorHandler = function() {
        global.mainErrorHandler = new ErrorHandler();
    };

    var initHistoryHandler = function() {
        global.mainHistoryHandler = new HistoryHandler();
    };

    var initNoise = function(seed) {
        noise.seed(seed);
    };

    // USED KEYS:
    // 17, 90, 16, 88 (UNDO/REDO)
    var initKeys = function() {
        global.keyMap[17] = false;
        global.keyMap[90] = false;
        global.keyMap[89] = false;
        
        global.keyEventFired.undo = false;
        global.keyEventFired.redo = false;
    };

    var updateKeyEvent = function(e) {
        e = e || event; // to deal with IE
        global.keyMap[e.keyCode] = e.type == 'keydown';
        /* now ready to check conditionals */
    };

    window.onkeyup = function(e) {
        updateKeyEvent(e);
        if(global.keyMap[17] == false || global.keyMap[90] == false){
            global.keyEventFired.undo = false;
        }
        if(global.keyMap[17] == false || global.keyMap[89] == false){
            global.keyEventFired.redo = false;
        }
    };

    window.onkeydown = function(e) {
        var oldKeyMap = global.keyMap;
        updateKeyEvent(e);
            
        if(global.mainHistoryHandler !== null){
            if(global.keyMap[17] == true && global.keyMap[90] == true &&
                global.keyEventFired.undo == false){
                    global.mainHistoryHandler.doUndo();
                    console.log("UNDOOOOOO");
                    global.keyEventFired.undo = true;
            }
            if(global.keyMap[17] == true && global.keyMap[89] == true &&
                global.keyEventFired.redo == false){
                    global.mainHistoryHandler.doRedo();
                    console.log("REdooo");
                    global.keyEventFired.redo = true;
            }
        }
    };

    window.addEventListener("resize", function(){
        saveCalculatedDimensions();
        
        // resize canvas to CANVAS SIZE! aka main Div size!
        paper.view.viewSize.width = global.calcWidth;
        paper.view.viewSize.height = global.calcHeight;
        
        // move menus
        updateMenuPositions();
    });

    function displayFileImg(filename, evt) {
        var view = new jDataView(evt.target.result, 0, evt.size);
    }
}

// Export the function so it can be called from main.js
window.initGameRoom = initGameRoom;
