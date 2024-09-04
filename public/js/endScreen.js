// create a NEW canvas just for the endscreen to display drawings
function createEndScreenCanvas(drawingDiv) {

    const canvas = document.createElement('canvas');
    canvas.id = 'endScreenCanvas';
    canvas.width = 500; // TODO: CHANGE THIS SO ITS NOT SET AT 500
    canvas.height = 500;
    canvas.style.backgroundColor = 'white'; 

    drawingDiv.innerHTML = ''; 
    drawingDiv.appendChild(canvas); 

    // Initialize Paper.js
    paper.setup(canvas);

    return canvas;
}


function displayPlayerDesign(playerDesigns) {
    paper.project.clear();
    playerDesigns.forEach(design => {
        design.paths.forEach(pathData => {
            if (pathData.paperPath) {
                // create a NEW path from the Paper.js path data
                const path = new paper.Path();
                path.importJSON(JSON.stringify(pathData.paperPath));  // Import the path from JSON (stored from firebase)

                if (pathData.lastDisplaySettings && pathData.lastDisplaySettings.path) {
                    Object.assign(path, pathData.lastDisplaySettings.path);
                }

                // add the path to the canvas which DISPLAYS it
                path.addTo(paper.project);
            }
        });
    });

    // refresh the canvas
    paper.view.update();
}

//loads only player 1's design
function loadDesignFromFirebase(roomCode, playerNumber, drawingDiv) {
    const playerKey = playerNumber === 1 ? 'player1' : 'player2';
    const designsRef = ref(window.database, `rooms/${roomCode}/designs/${playerKey}`);

    onValue(designsRef, (snapshot) => {
        const designsData = snapshot.val();
        if (designsData) {
            // restores '.' back from '_'
            const restoredDesignsData = restoreInvalidKeys(designsData);
            const canvas = createEndScreenCanvas(drawingDiv);
            displayPlayerDesign(restoredDesignsData);
        } else {
            drawingDiv.textContent = 'No design found for this player.';
        }
    });
}


function showEndScreen(roomCode) {

    const existingEndScreen = document.getElementById('endScreen');
    if (existingEndScreen) {
        existingEndScreen.remove();
    }

    const endScreenDiv = document.createElement('div');
    endScreenDiv.id = 'endScreen';

    const title = document.createElement('div');
    title.id = 'gameTitle';
    title.textContent = 'PatchPartners';

    const drawingContainer = document.createElement('div');
    drawingContainer.id = 'drawingContainer';
    drawingContainer.style.display = 'flex';

    const player1Div = document.createElement('div');
    player1Div.id = 'player1Drawing';
    player1Div.style.flex = '1';
    player1Div.style.backgroundColor = 'white';
    player1Div.textContent = 'Loading Player 1\'s design...';
    drawingContainer.appendChild(player1Div);

    loadDesignFromFirebase(roomCode, 1, player1Div);

    const mainMenuBtn = document.createElement('button');
    mainMenuBtn.id = 'mainMenuBtn';
    mainMenuBtn.textContent = 'Main Menu';
    mainMenuBtn.onclick = function () {
        window.location.reload(); 
    };


    endScreenDiv.appendChild(title);
    endScreenDiv.appendChild(drawingContainer);
    endScreenDiv.appendChild(mainMenuBtn);


    document.body.appendChild(endScreenDiv);
}


window.showEndScreen = showEndScreen;
