function initGameRoom() {
    //maxWidth and maxHeight represents the max possible size of the drawing canvas 
    let maxWidth;
    let maxHeight;

    console.log("Initializing game room...");

    //list of all prompts
    const prompts = [
        "Draw a heart!",
        "Draw anything!"
    ];

    
    function getRandomPrompt() {
        const randomIndex = Math.floor(Math.random() * prompts.length);
        return prompts[randomIndex];
    }

    function calculateCanvasSize(width, height){
        //Since the canvas has to be a multiple of 100px by 100px, calculate the size of the canvas
        let minNumber = Math.min(width, height);
        return Math.floor(minNumber / 100) * 100;

    }
    //creates a temp div to get the max size of the canvas
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

    


    function addHtmlContent() {
        calculateMaxDivSize();
        const canvasSize = calculateCanvasSize(maxWidth,maxHeight);
        
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
            <div class="wrapper" id="mainDiv" style="width: ${canvasSize}px; height: ${canvasSize}px; display: inline-block;">
                <div id="svg_div" style="width: 100%; height: 100%;">
                    <canvas id="canvas" style="width: 100%; height: 100%;"></canvas>
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

       
    
        //code for the prompt popup at the beginning of the game
        const selectedPrompt = getRandomPrompt();
        var popup = document.createElement('div');
        popup.className = "sav-popup";
        popup.innerHTML = `
            <div class="sav-popup-content">
                <img src="https://i.imgur.com/8Fo5FWh.png" alt="Sav" class="sav-image">
                <p class="sav-prompt">Your drawing prompt is: <strong>${selectedPrompt}</strong></p>
                <button id="startDrawingBtn" class="start-drawing-btn">Start Drawing</button>
            </div>
        `;
    
        document.body.appendChild(popup);
        console.log("Sav Popup added");
    
        // button for starting the game
        document.getElementById('startDrawingBtn').addEventListener('click', () => {
            closePopup();
        });
    }
    

    function closePopup() {
        var popup = document.querySelector('.sav-popup');
        if (popup) {
            popup.style.display = 'none'; // Hide the popup
        }
        console.log("Popup closed, game started");
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
        calculateMaxDivSize();
        const correctCanvasSize = calculateCanvasSize(maxWidth,maxHeight);
        mainDiv.style.width = `${correctCanvasSize}px`;  
        mainDiv.style.height = `${correctCanvasSize}px`;


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
