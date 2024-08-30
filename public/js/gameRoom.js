function initGameRoom(socket,roomCode, prompt, player1) {
    //maxWidth and maxHeight represents the max possible size of the drawing canvas 
    let maxWidth;
    let maxHeight;
    let updateTimer;

    console.log("Initializing game room...");
    console.log("Prompt received:", prompt);

  

    function calculateCanvasSize(width, height){
        //Since the canvas has to be a multiple of 100px by 100px, calculate the size of the canvas
        let minNumber = Math.min(width, height);
        return Math.floor(minNumber / 100) * 100 - 100;

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
        // calculates the max size of the canvas 
        // calculateMaxDivSize();
        // const canvasSize = calculateCanvasSize(maxWidth, maxHeight);
        
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
    
        //Attached the css for the end screen
        var link4 = document.createElement('link');
        link4.rel = "stylesheet";
        link4.type = "text/css";
        link4.href = "css/endScreen.css"; 
    
        // Create the main divs
        var mainDiv = document.createElement('div');
        var parentDiv = document.createElement('div');
        parentDiv.className = "fill-area";
        parentDiv.id = "hundred";
        parentDiv.style.position = 'relative';
    
        // Title row div at the top
        var titleRowDiv = document.createElement('div');
        titleRowDiv.id = "titleRow";
    
        // Title inside the title row
        var titleDiv = document.createElement('div');
        titleDiv.id = "gameTitle";
        titleDiv.textContent = "PatchPartners";
    
        titleRowDiv.appendChild(titleDiv);
        mainDiv.appendChild(titleRowDiv);
    
        // Timer div
        var timerDiv = document.createElement('div');
        timerDiv.id = "timer";
    
        // Wrapper div that contains the canvas
        var wrapperDiv = document.createElement('div');
        wrapperDiv.className = "wrapper";
        wrapperDiv.id = "mainDiv";
        wrapperDiv.style.display = "flex"; // Ensure it behaves as a flex container
    
        // Create the canvas div
        var canvasDiv = document.createElement('canvas');
        canvasDiv.id = "canvas";
        
    
        // Create the adjacent div/ fake canvas that will eventually hold other player's drawing
        var adjacentDiv = document.createElement('div');
        adjacentDiv.id = 'adjacentDiv';
        
    
        //Depending on player number, they are assigned the left or right half of the canvas
        //Player1 = left
        //Player2 = right
        if(player1){
            wrapperDiv.appendChild(canvasDiv);
            wrapperDiv.appendChild(adjacentDiv);
        
        }else{
            wrapperDiv.appendChild(adjacentDiv);
            wrapperDiv.appendChild(canvasDiv);
        }
    
        // Append the wrapper and timer to the parent div
        parentDiv.appendChild(wrapperDiv);
        parentDiv.appendChild(timerDiv);
    
        
        var additionalDiv = document.createElement('div');
        additionalDiv.innerHTML = `
            <div class="menu_div" id="image_options">Image Options
                <input type="file" id="uploadImg" name="files[]" class="image_options_menuGuts menu_item"/>    
            </div>
            <div class="menu_div_nonExpanding" id="print"></div>
            <div class="menu_div_nonExpanding" id="toolbox"></div>
        `;
        additionalDiv.id = 'imageOptions';
    
        parentDiv.appendChild(additionalDiv);
        mainDiv.appendChild(parentDiv);
    
        document.body.appendChild(mainDiv);
        document.head.appendChild(link1);
        document.head.appendChild(link2);
        document.head.appendChild(link3);
        document.head.appendChild(link4);
        console.log("Append Children");
    
        // Transparent overlay behind the prompt
        const overlay = document.createElement('div');
        overlay.id = 'savOverlay';
        document.body.appendChild(overlay);
    
        // The prompt popup before the game starts
        // const selectedPrompt = getRandomPrompt();
        var popup = document.createElement('div');
        popup.className = "sav-popup";
        popup.innerHTML = `
            <div class="sav-popup-content">
                <img src="https://i.imgur.com/8Fo5FWh.png" alt="Sav" class="sav-image">
                <p class="sav-prompt">Your drawing prompt is: <strong>${prompt}</strong></p>
                <button id="startDrawingBtn" class="start-drawing-btn">Start Drawing</button>
                <p id="waitingMessage" style="display: none;">Waiting for other player...</p>
            </div>
        `;
        document.body.appendChild(popup);
        console.log("Sav Popup added");
    
        document.getElementById('startDrawingBtn').addEventListener('click', () => {
            socket.emit('playerReady', { roomCode });
            document.getElementById('startDrawingBtn').style.display = 'none';
            document.getElementById('waitingMessage').style.display = 'block';
        });
    
        socket.on('startDrawing', () => {
            closePopup();
        });
    
        socket.on('startTimer', ({ duration, startTime }) => {
            startCountdownTimer(duration, startTime);
        });
    
        socket.on('waitingForPlayer', () => {
            document.getElementById('waitingMessage').textContent = "Waiting for other player...";
        });
    }
    


    function startCountdownTimer(duration, startTime) {
        const timerElement = document.getElementById('timer');
        const endTime = startTime + duration;
    
        function updateTimerFunction() {
            const currentTime = Date.now();
            const timeLeft = Math.max(0, endTime - currentTime);
    
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
    
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
            if (timeLeft > 0) {
                updateTimer = requestAnimationFrame(updateTimerFunction);
            } else {
                timerElement.textContent = "Time's up!";
                closeGameRoom();
                showEndScreen();
            }
        }
    
        updateTimer = requestAnimationFrame(updateTimerFunction);
    }
    

    

    function closePopup() {
        var popup = document.querySelector('.sav-popup');
        var overlay = document.getElementById('savOverlay');
        if (popup) {
            popup.style.display = 'none'; 
        }
        if (overlay) {
            overlay.style.display = 'none'; 
        }
        console.log("Popup closed, game started");
    }

    function closeGameRoom() {
        console.log("Closing game room...");
    
        // Check if the updateTimer is defined and stop any ongoing timers or animations
        if (window.updateTimer) {
            window.cancelAnimationFrame(window.updateTimer);
            window.updateTimer = null;
        }
    
        // Remove the gameroom elements
        const mainDiv = document.getElementById('hundred');
        if (mainDiv) {
            mainDiv.remove();
        }
    
        // Remove the title
        const titleRow = document.getElementById('titleRow');
        if (titleRow) {
            titleRow.remove();
        }
    
        // Remove any popups
        const popup = document.querySelector('.sav-popup');
        if (popup) {
            popup.remove();
        }
    
        // Clean up any global variables or event listeners
        if (window.mainCanvasHandler) {
            window.mainCanvasHandler = null;
        }
        if (window.mainHistoryHandler) {
            window.mainHistoryHandler = null;
        }
        if (window.mainDesignHandler) {
            window.mainDesignHandler = null;
        }
    
        
        console.log("Game room closed.");
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

    function saveCalculatedDimensions(height,width) {
        global.calcHeight = height;
        global.calcWidth = width;
        
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
        resize();
    });

    function resize() {
        // Calculate max dimensions
        calculateMaxDivSize();
        const correctCanvasSize = calculateCanvasSize(maxWidth, maxHeight);
        console.log('max width: ', correctCanvasSize);
        console.log('max height: ', correctCanvasSize);
    
        // Update the wrapper dimensions
        const wrapperDiv = document.getElementById('mainDiv');
        if (wrapperDiv) {
            wrapperDiv.style.width = `${correctCanvasSize+50}px`;
            wrapperDiv.style.height = `${correctCanvasSize+50}px`;
        }
    
        // Update the canvas dimensions
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.style.width = `${correctCanvasSize / 2}px`;  // Half width for the canvas
            canvas.style.height = `${correctCanvasSize}px`;
        }
    
        // Update the adjacent div dimensions to match the canvas
        const adjacentDiv = document.getElementById('adjacentDiv');
        if (adjacentDiv) {
            adjacentDiv.style.width = `${correctCanvasSize / 2}px`;  // Same half width as the canvas
            adjacentDiv.style.height = `${correctCanvasSize}px`;
        }
    
        saveCalculatedDimensions(correctCanvasSize, correctCanvasSize);
        paper.view.viewSize.width = correctCanvasSize / 2;
        paper.view.viewSize.height = correctCanvasSize;
        updateMenuPositions();
    }
    
    
    

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
window.initGameRoom = initGameRoom;
