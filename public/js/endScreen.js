// create a NEW canvas just for the endscreen to display drawings
function createEndScreenCanvas(drawingDiv) {

    const canvas = document.createElement('canvas');
    canvas.id = 'endScreenCanvas';
    canvas.width = 500; // TODO: CHANGE THIS SO ITS NOT HARDCODED
    canvas.height = 500;
    canvas.style.backgroundColor = 'white'; 

    drawingDiv.innerHTML = ''; 
    drawingDiv.appendChild(canvas); 

    // Initialize Paper.js
    paper.setup(canvas);

    return canvas;
}

function displayPlayerDesign(playerDesigns,translation) {
    playerDesigns.forEach(design => {
        design.paths.forEach(pathData => {
            if (pathData.paperPath) {
                // create a NEW path from the Paper.js path data
                const path = new paper.Path();
                path.importJSON(JSON.stringify(pathData.paperPath)); 

                if (pathData.lastDisplaySettings && pathData.lastDisplaySettings.path) {
                    Object.assign(path, pathData.lastDisplaySettings.path);
                }

                //translation for player2's design
                if (translation !== 0) {
                    path.translate(new paper.Point(translation, 0));
                }

                // add the path to the canvas which DISPLAYS it
                path.addTo(paper.project);
            }
        });
    });

    // refresh the canvas
    paper.view.update();
}




function loadDesignFromFirebase(roomCode, drawingDiv) {
    const player1DesignsRef = ref(window.database, `rooms/${roomCode}/designs/player1`);
    const player2DesignsRef = ref(window.database, `rooms/${roomCode}/designs/player2`);

    //variable for "is player's design loaded from firebase"
    let player1Loaded = false;
    let player2Loaded = false;


    onValue(player1DesignsRef, (snapshot) => {
        const player1Data = snapshot.val();
        //if either player's design is empty (didnt draw anythig), use an empty list
        const restoredPlayer1DesignsData = player1Data ? restoreInvalidKeys(player1Data) : [];
        player1Loaded = true;
        
        //repeat for player 2
        onValue(player2DesignsRef, (player2Snapshot) => {
            const player2Data = player2Snapshot.val();
            const restoredPlayer2Data = player2Data ? restoreInvalidKeys(player2Data) : [];
            player2Loaded = true;


            if (player1Loaded && player2Loaded) {
                const canvas = createEndScreenCanvas(drawingDiv);

                displayPlayerDesign(restoredPlayer1DesignsData);

                const translationDistance = 250; // TODO: change so width isnt hard coded
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

    //create the title
    const title = document.createElement('div');
    title.id = 'gameTitle';
    title.textContent = 'PatchPartners';

    
    //Original approach: create a container that contains both player's drawing side by side
    //CAN REMOVE THIS.
    const drawingContainer = document.createElement('div');
    drawingContainer.id = 'drawingContainer';
    drawingContainer.style.display = 'flex';


    const player1Div = document.createElement('div');
    player1Div.id = 'player1Drawing';
    player1Div.style.flex = '1';
    player1Div.style.backgroundColor = 'white';
    player1Div.textContent = 'Loading design...';
    drawingContainer.appendChild(player1Div);

    loadDesignFromFirebase(roomCode, player1Div);
    

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
