function createEndScreenCanvas(drawingDiv) {
    const canvas = document.createElement('canvas');
    canvas.id = 'endScreenCanvas';

    // Set initial size for the canvas
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.width = '500px';
    canvas.style.height = '500px';

    drawingDiv.innerHTML = ''; 
    drawingDiv.appendChild(canvas);

    paper.setup(canvas);

    if (paper.tool) {
        paper.tool.remove();
    }

    // Add an event listener for resizing
    window.addEventListener('resize', () => setCanvasSize(canvas));

    return canvas;
}

// Function to set canvas size based on screen dimensions while keeping the original 500x500px aspect ratio
function setCanvasSize(canvas) {
    const width = window.innerWidth * 0.8;
    const height = window.innerHeight * 0.8;
    const scaleFactor = calculateScaleFactor(width, height);

    // Apply the scale factor to the canvas size
    const newSize = 500 * scaleFactor;
    canvas.width = newSize;
    canvas.height = newSize;
    canvas.style.width = `${newSize}px`;
    canvas.style.height = `${newSize}px`;

    // Update the Paper.js view size accordingly and rescale existing drawings
    if (paper.view) {
        paper.view.viewSize = new paper.Size(newSize, newSize);
        scaleDrawings(scaleFactor);
        paper.view.update();
    }
}

// Function to calculate the scale factor based on the screen dimensions
function calculateScaleFactor(width, height) {
    const minDimension = Math.min(width, height);
    return minDimension / 500;  // Scale relative to the original 500px size
}

function scaleDrawings(scaleFactor) {
    if (paper.project) {
        paper.project.activeLayer.scale(scaleFactor);
    }
}

function displayPlayerDesign(playerDesigns, translation) {
    playerDesigns.forEach(design => {
        design.paths.forEach(pathData => {
            if (pathData.paperPath) {
                try {
                    // Create a NEW path from the Paper.js path data
                    let path = new paper.Path();
                    path.importJSON(JSON.stringify(pathData.generatedPath)); 

                    // Apply last display settings
                    if (pathData.lastDisplaySettings && pathData.lastDisplaySettings.generatedPath) {
                        Object.assign(path, pathData.lastDisplaySettings.generatedPath);
                    }

                    // Apply translation for player 2's design
                    if (translation !== 0) {
                        path.translate(new paper.Point(translation, 0));
                    }

                    // Add the path to the canvas which displays it
                    path.addTo(paper.project);

                } catch (error) {
                    console.error("Error displaying design path: ", error);
                }
            }
        });
    });

    // Refresh the canvas
    paper.view.update();
}

// Load designs from Firebase and display them
function loadDesignFromFirebase(roomCode, drawingDiv, callback) {
    const player1DesignsRef = ref(window.database, `rooms/${roomCode}/designs/player1`);
    const player2DesignsRef = ref(window.database, `rooms/${roomCode}/designs/player2`);

    let player1Designs = null;
    let player2Designs = null;

    // Load player 1's designs
    onValue(player1DesignsRef, (snapshot) => {
        const player1Data = snapshot.val();
        player1Designs = player1Data ? restoreInvalidKeys(player1Data) : [];
        checkDesignsLoaded();  // Check if both players' designs are loaded
    });

    // Load player 2's designs
    onValue(player2DesignsRef, (snapshot) => {
        const player2Data = snapshot.val();
        player2Designs = player2Data ? restoreInvalidKeys(player2Data) : [];
        checkDesignsLoaded();  // Check if both players' designs are loaded
    });

    // Function to check if both designs are loaded
    function checkDesignsLoaded() {
        if (player1Designs !== null && player2Designs !== null) {
            const canvas = createEndScreenCanvas(drawingDiv);
            displayPlayerDesign(player1Designs, 0); // No translation for player 1

            const translationDistance = canvas.width / 2; // Dynamic translation distance for player 2
            displayPlayerDesign(player2Designs, translationDistance);

            callback(player1Designs, player2Designs); // Pass both designs to the callback
        }
    }
}

// Initialize end screen
function showEndScreen(roomCode) {
    const existingEndScreen = document.getElementById('endScreen');
    if (existingEndScreen) {
        existingEndScreen.remove();
    }

    const endScreenDiv = document.createElement('div');
    endScreenDiv.id = 'endScreen';

    // Create the title
    const title = document.createElement('div');
    title.id = 'gameTitle';
    title.textContent = 'PatchPartners';

    // Create a container for both players' drawings
    const drawingContainer = document.createElement('div');
    drawingContainer.id = 'finishedDrawing';

    const player1Div = document.createElement('div');
    player1Div.id = 'player1Drawing';
    player1Div.style.flex = '1';
    player1Div.style.backgroundColor = 'white';
    player1Div.textContent = 'Loading design...';

    drawingContainer.appendChild(player1Div);

    // Load both player's designs from Firebase
    loadDesignFromFirebase(roomCode, player1Div, (player1Designs, player2Designs) => {
        // After loading, create a new DesignHandler and populate it with the loaded designs
        global.endScreenDesignHandler = new DesignHandler();

        // Merge the designs from both players and add them to the DesignHandler
        const combinedDesigns = player1Designs.concat(player2Designs); // Simple merge for example
        combinedDesigns.forEach(design => {
            global.endScreenDesignHandler.makeAndSetNewDesign();
            global.endScreenDesignHandler.designs[global.endScreenDesignHandler.activeDesign].makeNewPath(design);
        });

        console.log("End screen DesignHandler initialized with combined designs.");
    });

    // Add the "Save to DST" button for the end screen
    const saveButton = document.createElement('button');
    saveButton.id = 'saveButton';
    saveButton.textContent = 'Save to DST';
    saveButton.onclick = function () {
        if (global.endScreenDesignHandler) {
            global.endScreenDesignHandler.saveAllDesignsToFile();  // Save the combined design to DST
        } else {
            console.error("DesignHandler for end screen is not initialized.");
        }
    };

    // Main menu button
    const mainMenuBtn = document.createElement('button');
    mainMenuBtn.id = 'mainMenuBtn';
    mainMenuBtn.textContent = 'Main Menu';
    mainMenuBtn.onclick = function () {
        window.location.reload(); 
    };
    
    // Append elements to the end screen
    endScreenDiv.appendChild(title);
    endScreenDiv.appendChild(drawingContainer);
    endScreenDiv.appendChild(saveButton);  
    endScreenDiv.appendChild(mainMenuBtn);

    document.body.appendChild(endScreenDiv);
}

window.showEndScreen = showEndScreen;
