function initGameRoom(socket, roomCode, prompt, player1) {
    // maxWidth and maxHeight represent the max possible size of the drawing canvas 
    let maxWidth;
    let maxHeight;
    let updateTimer;
    let oldCanvasSize;

    console.log("Initializing game room...");
    console.log("Prompt received:", prompt);

    //Function to calculate the canvas size based on the screen dimensions
    //The canvas size must be a multiple of 100px
    function calculateCanvasSize(width, height) {
        //Calculate the smallest dimension and round it down to the nearest 100px
        let minNumber = Math.min(width, height);
        return Math.floor(minNumber / 100) * 100 - 100;
    }

    //Creates a temporary div to measure the maximum available canvas size
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

    //Adds all HTML content dynamically ( title, canvas, and prompt )
    function addHtmlContent() {
        //Setting meta tag and document title
        document.xmlns = "http://www.w3.org/1999/xhtml";
        document.head.innerHTML = `
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>PatchPartners</title>
        `;
        
        //Create link elements for stylesheets
        var link1 = createLinkElement("css/jquery-ui.css");
        var link2 = createLinkElement("css/jquery-ui.theme.css");
        var link3 = createLinkElement("css/sewsynth.css");
        var link4 = createLinkElement("css/endScreen.css");

        //Create the main div elements (contains the canvas and brush bar)
        var mainDiv = document.createElement('div');
        var parentDiv = document.createElement('div');
        parentDiv.className = "fill-area";
        parentDiv.id = "hundred";
        parentDiv.style.position = 'relative';

        //Create title row
        var titleRowDiv = document.createElement('div');
        titleRowDiv.id = "titleRow";

        //Create title inside the title row
        var titleDiv = document.createElement('div');
        titleDiv.id = "gameTitle";
        titleDiv.textContent = "PatchPartners";

        titleRowDiv.appendChild(titleDiv);
        mainDiv.appendChild(titleRowDiv);

        //Timer div
        var timerDiv = document.createElement('div');
        timerDiv.id = "timer";

        //Wrapper div that contains the canvas
        var wrapperDiv = document.createElement('div');
        wrapperDiv.className = "wrapper";
        wrapperDiv.id = "mainDiv";
        wrapperDiv.style.display = "flex"; // Ensure it behaves as a flex container

        //Create the canvas div (where players draw)
        var canvasDiv = document.createElement('canvas');
        canvasDiv.id = "canvas";

        //Create the adjacent div/fake canvas that will hold the other player's drawing
        var adjacentDiv = document.createElement('div');
        adjacentDiv.id = 'adjacentDiv';

        //Depending on player number, they are assigned the left or right half of the canvas
        //Player1 = left, Player2 = right
        //TODO: randomize this?
        if (player1) {
            wrapperDiv.appendChild(canvasDiv);
            wrapperDiv.appendChild(adjacentDiv);
        } else {
            wrapperDiv.appendChild(adjacentDiv);
            wrapperDiv.appendChild(canvasDiv);
        }

        //Append the wrapper and timer to the parent div
        parentDiv.appendChild(wrapperDiv);
        parentDiv.appendChild(timerDiv);

        //Create and append additional div for image options and toolbox
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

        //Attach all stylesheets to the document head
        document.head.appendChild(link1);
        document.head.appendChild(link2);
        document.head.appendChild(link3);
        document.head.appendChild(link4);
        console.log("Append Children");

        //Transparent overlay behind the prompt
        const overlay = document.createElement('div');
        overlay.id = 'savOverlay';
        document.body.appendChild(overlay);

        //Add the prompt popup before the game starts
        var popup = createPopup(prompt);
        document.body.appendChild(popup);
        console.log("Sav Popup added");

        //Event listener for the "Start Drawing" button
        document.getElementById('startDrawingBtn').addEventListener('click', () => {
            socket.emit('playerReady', { roomCode });
            document.getElementById('startDrawingBtn').style.display = 'none';
            document.getElementById('waitingMessage').style.display = 'block';
        });

        //Socket events for game state synchronization
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

    //Countdown timer for the game
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
                endGame();  // End the game, save designs, and show the end screen
                closeGameRoom(); 
                
            }
        }

        updateTimer = requestAnimationFrame(updateTimerFunction);
    }

    //Function to save player designs and scale them to 500px before saving
    function savePlayerDesigns(roomCode, playerNumber) {
        const canvas = document.getElementById('canvas');
        oldCanvasSize = parseInt(canvas.style.height, 10) || 500; 

        //Before storing the path details, scale the drawings to 500px so that both drawings are the same size
        const scale = 500 / oldCanvasSize;
        global.mainDesignHandler.resize(scale);

        //Save the designs to Firebase
        if (typeof global.mainDesignHandler !== 'undefined' && global.mainDesignHandler.designs) {
            saveDesignsToFirebase(roomCode, playerNumber, global.mainDesignHandler.designs);
        } else {
            console.error("Designs are not available to save.");
        }
    }

    //Ends the game, saves designs, and shows the end screen
    function endGame() {
        const playerNumber = player1 ? 1 : 2;
        savePlayerDesigns(roomCode, playerNumber);
        showEndScreen(roomCode);
    }

    //Closes the prompt overlay at the start of the game
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

    //Cleans up and closes the game room after the game ends
    function closeGameRoom() {
        console.log("Closing game room...");

        //Stop any ongoing timers or animations
        if (window.updateTimer) {
            window.cancelAnimationFrame(window.updateTimer);
            window.updateTimer = null;
        }

        //Remove game room elements
        const mainDiv = document.getElementById('hundred');
        if (mainDiv) {
            mainDiv.remove();
        }

        const titleRow = document.getElementById('titleRow');
        if (titleRow) {
            titleRow.remove();
        }

        const popup = document.querySelector('.sav-popup');
        if (popup) {
            popup.remove();
        }

        //Clean up global variables or event listeners
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
            updateMenuPositions(); // Move menus over, also update on resize...
            console.log("7");
            
            initKeys(); // Initialize key bindings
        
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
        e = e || event; 
        global.keyMap[e.keyCode] = e.type == 'keydown';
    }

    //Saves the calculated dimensions for the canvas (globally)
    function saveCalculatedDimensions(height, width) {
        global.calcHeight = height;
        global.calcWidth = width;
        
        console.log("calculating height & width... " + global.calcHeight + ", " + global.calcWidth);
    }

    //Handle resizing of the window and adjust canvas dimensions
    window.addEventListener("resize", function() {
        resize();
    });

    //Resizes the canvas and updates the canvas based on window size
    function resize() {
        //Calculate max dimensions
        calculateMaxDivSize();
        const canvas = document.getElementById('canvas');
        if (canvas) {
            oldCanvasSize = parseInt(canvas.style.height, 10) || 600;
            console.log('oldCanvasSize: ', oldCanvasSize);
        }

        const correctCanvasSize = calculateCanvasSize(maxWidth, maxHeight);
        console.log('correctCanvasSize:', correctCanvasSize);
        console.log('max width: ', correctCanvasSize / 2);
        console.log('max height: ', correctCanvasSize);

        //Update the wrapper dimensions
        const wrapperDiv = document.getElementById('mainDiv');
        if (wrapperDiv) {
            wrapperDiv.style.width = `${correctCanvasSize + 50}px`;
            wrapperDiv.style.height = `${correctCanvasSize + 50}px`;
        }

        //Update the canvas dimensions
        if (canvas) {
            canvas.style.width = `${correctCanvasSize / 2}px`;  //Half width for one player
            canvas.style.height = `${correctCanvasSize}px`;
        }

        //Update the adjacent div dimensions to match the canvas
        const adjacentDiv = document.getElementById('adjacentDiv');
        if (adjacentDiv) {
            adjacentDiv.style.width = `${correctCanvasSize / 2}px`;  //Same half width as the canvas
            adjacentDiv.style.height = `${correctCanvasSize}px`;
        }

        saveCalculatedDimensions(correctCanvasSize, correctCanvasSize);
        updateMenuPositions();

        //Scale the drawing to match the new canvas size
        const scale = correctCanvasSize / oldCanvasSize;  
        global.mainDesignHandler.resize(scale);

        paper.view.viewSize = new paper.Size(correctCanvasSize / 2, correctCanvasSize); // Adjust width based on player split
    }

    //Initialize the app and start the game room
    function onLoad() {
        addHtmlContent(); //Add the HTML content dynamically
        document.getElementById('uploadImg').addEventListener('change', handleFileSelection, false);
        initApp(); //Initialize canvas, design handlers, and more
        resize(); //Perform initial resize and adjust layout
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onLoad); //Load when DOM is ready
    } else {
        onLoad(); //Load immediately if DOM is already ready
    }
}

//Export the function so it can be called from main.js
window.initGameRoom = initGameRoom;

//Utility functions for creating elements
function createLinkElement(href) {
    const link = document.createElement('link');
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    return link;
}

//Creates the prompt popup before the game starts
function createPopup(prompt) {
    const popup = document.createElement('div');
    popup.className = "sav-popup";
    popup.innerHTML = `
        <div class="sav-popup-content">
            <img src="https://i.imgur.com/8Fo5FWh.png" alt="Sav" class="sav-image">
            <p class="sav-prompt">Your drawing prompt is: <strong>${prompt}</strong></p>
            <button id="startDrawingBtn" class="start-drawing-btn">Start Drawing</button>
            <p id="waitingMessage" style="display: none;">Waiting for other player...</p>
        </div>
    `;
    return popup;
}
