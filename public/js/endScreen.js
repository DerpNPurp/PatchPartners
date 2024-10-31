function createEndScreenCanvas(drawingDiv) {
    const canvas = document.createElement('canvas');
    canvas.id = 'endScreenCanvas';
    
    // Set dynamic sizing for canvas
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    drawingDiv.innerHTML = ''; 
    drawingDiv.appendChild(canvas);

    // Initialize Paper.js
    paper.setup(canvas);

    return canvas;
}

function displayPlayerDesign(playerDesigns, translation) {
    playerDesigns.forEach(design => {
        design.paths.forEach(pathData => {
            if (pathData.paperPath) {
                let path = new paper.Path();
                path.importJSON(JSON.stringify(pathData.generatedPath)); 

                if (pathData.lastDisplaySettings && pathData.lastDisplaySettings.generatedPath) {
                    Object.assign(path, pathData.lastDisplaySettings.generatedPath);
                }

                // Translation for player 2's design
                if (translation !== 0) {
                    path.translate(new paper.Point(translation, 0));
                }

                // Add the path to the canvas which displays it
                path.addTo(paper.project);
            }
        });
    });

    // Refresh the canvas
    paper.view.update();
}

function loadDesignFromFirebase(roomCode, drawingDiv) {
    const player1DesignsRef = ref(window.database, `rooms/${roomCode}/designs/player1`);
    const player2DesignsRef = ref(window.database, `rooms/${roomCode}/designs/player2`);

    let player1Loaded = false;
    let player2Loaded = false;

    onValue(player1DesignsRef, (snapshot) => {
        const player1Data = snapshot.val();
        const restoredPlayer1DesignsData = player1Data ? restoreInvalidKeys(player1Data) : [];
        player1Loaded = true;
        
        onValue(player2DesignsRef, (player2Snapshot) => {
            const player2Data = player2Snapshot.val();
            const restoredPlayer2Data = player2Data ? restoreInvalidKeys(player2Data) : [];
            player2Loaded = true;

            if (player1Loaded && player2Loaded) {
                const canvas = createEndScreenCanvas(drawingDiv);

                displayPlayerDesign(restoredPlayer1DesignsData);

                const translationDistance = 250; // Change as needed based on design width
                displayPlayerDesign(restoredPlayer2Data, translationDistance);
            }
        });
    });
}

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

    loadDesignFromFirebase(roomCode, drawingContainer);
    
    // Main Menu Button
    const mainMenuBtn = document.createElement('button');
    mainMenuBtn.id = 'mainMenuBtn';
    mainMenuBtn.textContent = 'Main Menu';
    mainMenuBtn.onclick = function () {
        window.location.reload(); 
    };
    
    // Append elements to the end screen
    endScreenDiv.appendChild(title);
    endScreenDiv.appendChild(drawingContainer);
    endScreenDiv.appendChild(mainMenuBtn);

    document.body.appendChild(endScreenDiv);
}

// Adjust canvas size dynamically on window resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('endScreenCanvas');
    if (canvas) {
        paper.view.viewSize = new paper.Size(canvas.clientWidth, canvas.clientHeight);
        paper.view.update();
    }
});

// Example usage
window.showEndScreen = showEndScreen;
